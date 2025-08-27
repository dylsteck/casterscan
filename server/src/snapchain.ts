import { HubEventType, getSSLHubRpcClient } from '@farcaster/hub-nodejs';
import { getSnapchainHttpUrl, getSnapchainGrpcHost } from 'shared/dist/index.js';
import { FarcasterApiClient } from './farcaster';

export interface SubscribeRequest {
  eventTypes?: HubEventType[];
  fromId?: number;
  shardIndex?: number;
}

export interface EnrichedEvent {
  id: string;
  username: string;
  content: string;
  link: string;
  time: string;
  type: string;
  embeds?: string;
}

export class SnapchainClient {
  private client: ReturnType<typeof getSSLHubRpcClient>;
  private farcasterApi: FarcasterApiClient;
  private nodeUrl: string;
  
  constructor(nodeUrl?: string) {
    this.nodeUrl = getSnapchainHttpUrl(nodeUrl);
    const grpcHost = getSnapchainGrpcHost(nodeUrl);
    
    this.client = getSSLHubRpcClient(grpcHost, {
      'grpc.keepalive_time_ms': 30000,
      'grpc.keepalive_timeout_ms': 5000,
      'grpc.keepalive_permit_without_calls': 1,
      'grpc.http2.max_pings_without_data': 0,
      'grpc.http2.min_time_between_pings_ms': 10000,
      'grpc.http2.min_ping_interval_without_data_ms': 300000,
      'grpc.max_receive_message_length': 1024 * 1024 * 16,
      'grpc.max_send_message_length': 1024 * 1024 * 16,
      'grpc.so_reuseport': 1,
      'grpc.use_local_subchannel_pool': 1
    });
    this.farcasterApi = new FarcasterApiClient();
  }

  private async *httpFallbackStream(request: SubscribeRequest): AsyncGenerator<EnrichedEvent, void, unknown> {
    let seenHashes = new Set<string>();
    let lastTimestamp = Math.floor(Date.now() / 1000) - 60;
    
    const activeFids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 616, 3621, 194, 239, 1689, 99, 13242];
    let fidIndex = 0;
    
    while (true) {
      try {
        const currentBatch = activeFids.slice(fidIndex, fidIndex + 10);
        fidIndex = (fidIndex + 10) % activeFids.length;
        
        const promises = currentBatch.map(async (fid) => {
          try {
            const response = await fetch(`${this.nodeUrl}/v1/castsByFid?fid=${fid}&pageSize=10`, {
              signal: AbortSignal.timeout(5000)
            });
            if (response.ok) {
              const data = await response.json() as any;
              return { fid, messages: data.messages || [] };
            }
            return { fid, messages: [] };
          } catch (e) {
            return { fid, messages: [] };
          }
        });
        
        const results = await Promise.all(promises);
        const newEvents: EnrichedEvent[] = [];
        
        for (const { fid, messages } of results) {
          for (const message of messages) {
            const hash = message.hash;
            const messageTimestamp = message.data?.timestamp || 0;
            
            if (!seenHashes.has(hash) && messageTimestamp > lastTimestamp) {
              seenHashes.add(hash);
              lastTimestamp = Math.max(lastTimestamp, messageTimestamp);
              
              const enrichedEvent: EnrichedEvent = {
                id: hash,
                username: `fid${fid}`,
                content: message.data?.castAddBody?.text || 'Cast',
                link: `${this.nodeUrl}/v1/castById?hash=${hash}&fid=${fid}`,
                time: new Date(messageTimestamp * 1000).toISOString(),
                type: 'cast',
                embeds: message.data?.castAddBody?.embeds?.length ? message.data.castAddBody.embeds.length.toString() : undefined
              };
              
              newEvents.push(enrichedEvent);
            }
          }
        }
        
        newEvents.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
        for (const event of newEvents) {
          yield event;
        }
        
        if (seenHashes.size > 500) {
          seenHashes.clear();
          lastTimestamp = Math.floor(Date.now() / 1000) - 30;
        }
        
      } catch (error) {
        // Continue on error
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async subscribe(request: SubscribeRequest): Promise<AsyncGenerator<EnrichedEvent, void, unknown>> {
    return new Promise<AsyncGenerator<EnrichedEvent, void, unknown>>((resolve) => {
      const timeout = 10000;
      const deadline = Date.now() + timeout;

      (this.client as any).$.waitForReady(deadline, async (e: any) => {
        if (e) {
          resolve(this.httpFallbackStream(request));
          return;
        }

        try {
          const subscribeResult = await this.client.subscribe({
            eventTypes: request.eventTypes || [HubEventType.MERGE_MESSAGE],
            fromId: request.fromId,
            shardIndex: request.shardIndex || 1,
          });

          if (subscribeResult.isOk()) {
            const stream = subscribeResult.value;
            
            const self = this;
            async function* generator() {
              try {
                for await (const event of stream) {
                  const enrichedEvent = await self.enrichEvent(event);
                  if (enrichedEvent) {
                    yield enrichedEvent;
                  }
                }
              } catch (streamError) {
                // Stream ended
              }
            }
            
            resolve(generator());
          } else {
            resolve(this.httpFallbackStream(request));
          }
        } catch (error) {
          resolve(this.httpFallbackStream(request));
        }
      });
    });
  }

  private async enrichEvent(rawEvent: any): Promise<EnrichedEvent | null> {
    const id = rawEvent.id?.toString() || 'unknown';
    const time = new Date().toISOString();
    const eventType = rawEvent.type as HubEventType;

    if (eventType === HubEventType.MERGE_MESSAGE) {
      const messageData = rawEvent.mergeMessageBody?.message?.data;
      if (!messageData) return null;
      
      const fid = messageData.fid || 0;
      const username = await this.farcasterApi.getUsernameByFid(fid);
      
      if (messageData.type === 1) { // Cast
        const castText = messageData.castAddBody?.text || 'Empty cast';
        const hasEmbeds = messageData.castAddBody?.embeds?.length > 0;
        
        return {
          id,
          username,
          content: castText,
          link: `/casts/${id}`,
          time,
          type: 'cast',
          embeds: hasEmbeds ? '+1' : undefined
        };
      }
    }
    
    return null;
  }
}
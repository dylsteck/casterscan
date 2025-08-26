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
    
    // Production-optimized gRPC configuration
    const grpcOptions: any = {};
    
    if (this.isFlyEnvironment() || process.env.NODE_ENV === 'production') {
      grpcOptions['grpc.keepalive_time_ms'] = 20000;
      grpcOptions['grpc.keepalive_timeout_ms'] = 5000;
      grpcOptions['grpc.keepalive_permit_without_calls'] = 1;
      grpcOptions['grpc.http2.max_pings_without_data'] = 0;
      grpcOptions['grpc.http2.min_time_between_pings_ms'] = 5000;
      grpcOptions['grpc.http2.min_ping_interval_without_data_ms'] = 120000;
      grpcOptions['grpc.ssl_target_name_override'] = 'snap.farcaster.xyz';
      grpcOptions['grpc.default_authority'] = 'snap.farcaster.xyz';
      grpcOptions['grpc.enable_http_proxy'] = 0;
      grpcOptions['grpc.enable_channelz'] = 1;
      grpcOptions['grpc.max_receive_message_length'] = 8388608;
      grpcOptions['grpc.max_send_message_length'] = 8388608;
      grpcOptions['grpc.initial_reconnect_backoff_ms'] = 500;
      grpcOptions['grpc.max_reconnect_backoff_ms'] = 15000;
      grpcOptions['grpc.dns_resolution_timeout'] = 10000;
      grpcOptions['grpc.client_idle_timeout_ms'] = 300000;
    }
    
    this.client = getSSLHubRpcClient(grpcHost, grpcOptions);
    this.farcasterApi = new FarcasterApiClient();
  }

  private isRailwayEnvironment(): boolean {
    return !!(
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID ||
      process.env.RAILWAY_DEPLOYMENT_ID
    );
  }

  private isFlyEnvironment(): boolean {
    return !!(
      process.env.FLY_APP_NAME ||
      process.env.FLY_REGION ||
      process.env.FLY_MACHINE_ID ||
      process.env.FLY_ALLOC_ID
    );
  }

  private async *httpFallbackStream(request: SubscribeRequest): AsyncGenerator<EnrichedEvent, void, unknown> {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailway = this.isRailwayEnvironment();
    
    // Use Neynar API if available and in production/railway
    if ((isRailway || isProduction) && process.env.NEYNAR_API_KEY) {
      try {
        const testResponse = await fetch(`${this.nodeUrl}/v1/castsByFid?fid=1&pageSize=1`, {
          signal: AbortSignal.timeout(1500)
        });
        if (!testResponse.ok) {
          yield* this.neynarFallbackStream();
          return;
        }
      } catch (e) {
        yield* this.neynarFallbackStream();
        return;
      }
    }
    
    let seenHashes = new Set<string>();
    let lastTimestamp = Math.floor(Date.now() / 1000) - 60;
    let pollCount = 0;
    
    const activeFids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                       21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 616, 3621, 2, 194, 239, 1689, 99, 13242];
    
    let fidIndex = 0;
    
    while (true) {
      try {
        pollCount++;
        
        const currentBatch = activeFids.slice(fidIndex, fidIndex + 20);
        fidIndex = (fidIndex + 20) % activeFids.length;
        
        const promises = currentBatch.map(async (fid) => {
          try {
            const url = `${this.nodeUrl}/v1/castsByFid?fid=${fid}&pageSize=15`;
            const response = await fetch(url, {
              signal: AbortSignal.timeout(5000),
              headers: {
                'User-Agent': 'CasterScan/1.0',
                'Accept': 'application/json'
              }
            });
            if (response.ok) {
              const data = await response.json() as any;
              return { fid, messages: data.messages || [], success: true };
            } else {
              return { fid, messages: [], success: false };
            }
          } catch (e) {
            return { fid, messages: [], success: false };
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
                username: `fid-${fid}`,
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
        
        if (newEvents.length > 0) {
          for (const event of newEvents) {
            yield event;
          }
        }
        
        // Background username resolution
        if (newEvents.length > 0) {
          Promise.all(newEvents.map(async (event) => {
            if (event.username.startsWith('fid-')) {
              const fidNum = parseInt(event.username.replace('fid-', ''));
              try {
                await this.farcasterApi.getUsernameByFid(fidNum);
              } catch (e) {
                // Silent fail
              }
            }
          })).catch(() => {});
        }
        
        if (seenHashes.size > 1000) {
          seenHashes.clear();
          lastTimestamp = Math.floor(Date.now() / 1000) - 30;
        }
        
      } catch (error) {
        // Silent fail
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  private async *neynarFallbackStream(): AsyncGenerator<EnrichedEvent, void, unknown> {
    if (!process.env.NEYNAR_API_KEY) {
      return;
    }
    
    let seenHashes = new Set<string>();
    const activeFids = [1, 2, 3, 616, 3621, 194, 239, 1689, 99, 13242, 5, 6, 7, 8, 9, 10];
    
    while (true) {
      try {
        const promises = activeFids.slice(0, 10).map(async (fid) => {
          try {
            const response = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/fids?fids=${fid}&limit=5`, {
              headers: {
                'x-api-key': process.env.NEYNAR_API_KEY || '',
                'Content-Type': 'application/json'
              },
              signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
              const data = await response.json() as any;
              return { fid, casts: data.casts || [], success: true };
            } else {
              return { fid, casts: [], success: false };
            }
          } catch (e) {
            return { fid, casts: [], success: false };
          }
        });
        
        const results = await Promise.all(promises);
        const newEvents: EnrichedEvent[] = [];
        
        for (const { fid, casts } of results) {
          for (const cast of casts) {
            const hash = cast.hash;
            
            if (!seenHashes.has(hash)) {
              seenHashes.add(hash);
              
              const enrichedEvent: EnrichedEvent = {
                id: hash,
                username: cast.author?.username || `fid-${fid}`,
                content: cast.text || 'Cast',
                link: `https://warpcast.com/${cast.author?.username}/${hash.substring(0, 10)}`,
                time: cast.timestamp || new Date().toISOString(),
                type: 'cast',
                embeds: cast.embeds?.length ? cast.embeds.length.toString() : undefined
              };
              
              newEvents.push(enrichedEvent);
            }
          }
        }
        
        newEvents.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
        if (newEvents.length > 0) {
          for (const event of newEvents) {
            yield event;
          }
        }
        
        if (seenHashes.size > 500) {
          seenHashes.clear();
        }
        
      } catch (error) {
        // Silent fail
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  private async tryGrpcConnection(request: SubscribeRequest): Promise<AsyncGenerator<EnrichedEvent, void, unknown>> {
    const grpcHost = 'snap.farcaster.xyz:3383';
    const isProduction = process.env.NODE_ENV === 'production';
    const isFly = this.isFlyEnvironment();
    
    // Enhanced gRPC options for production
    const grpcOptions: any = {};
    if (isProduction || isFly) {
      grpcOptions['grpc.keepalive_time_ms'] = 20000;
      grpcOptions['grpc.keepalive_timeout_ms'] = 5000;
      grpcOptions['grpc.keepalive_permit_without_calls'] = 1;
      grpcOptions['grpc.http2.max_pings_without_data'] = 0;
      grpcOptions['grpc.http2.min_time_between_pings_ms'] = 5000;
      grpcOptions['grpc.http2.min_ping_interval_without_data_ms'] = 120000;
      grpcOptions['grpc.ssl_target_name_override'] = 'snap.farcaster.xyz';
      grpcOptions['grpc.default_authority'] = 'snap.farcaster.xyz';
      grpcOptions['grpc.enable_http_proxy'] = 0;
      grpcOptions['grpc.enable_channelz'] = 1;
      grpcOptions['grpc.max_receive_message_length'] = 8388608;
      grpcOptions['grpc.max_send_message_length'] = 8388608;
      grpcOptions['grpc.initial_reconnect_backoff_ms'] = 500;
      grpcOptions['grpc.max_reconnect_backoff_ms'] = 15000;
      grpcOptions['grpc.dns_resolution_timeout'] = 10000;
      grpcOptions['grpc.client_idle_timeout_ms'] = 300000;
    }
    
    const client = getSSLHubRpcClient(grpcHost, grpcOptions);

    return new Promise<AsyncGenerator<EnrichedEvent, void, unknown>>((resolve) => {
      const timeout = 30000;
      const deadline = Date.now() + timeout;

      (client as any).$.waitForReady(deadline, async (e: any) => {
        if (e) {
          resolve(this.httpFallbackStream(request));
          return;
        }

        try {
          const subscribeResult = await client.subscribe({
            eventTypes: request.eventTypes || [1, 2, 3],
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
        } catch (subscriptionError) {
          resolve(this.httpFallbackStream(request));
        }
      });
    });
  }

  async subscribe(request: SubscribeRequest): Promise<AsyncGenerator<EnrichedEvent, void, unknown>> {
    const isRailway = this.isRailwayEnvironment();
    const isFly = this.isFlyEnvironment();
    
    // Skip gRPC on Railway (HTTP/2 issues)
    if (isRailway) {
      return this.httpFallbackStream(request);
    }
    
    // Try gRPC first for Fly.io and other environments
    if (isFly) {
      return this.tryGrpcConnection(request);
    }
    
    // Standard gRPC attempt for other environments
    return new Promise<AsyncGenerator<EnrichedEvent, void, unknown>>((resolve) => {
      const isProduction = process.env.NODE_ENV === 'production';
      const timeout = isProduction ? 5000 : 8000;
      const deadline = Date.now() + timeout;

      (this.client as any).$.waitForReady(deadline, async (e: any) => {
        if (e) {
          resolve(this.httpFallbackStream(request));
          return;
        }

        try {
          const subscribeResult = await this.client.subscribe({
            eventTypes: request.eventTypes || [],
            fromId: request.fromId,
            shardIndex: request.shardIndex,
          });

          if (subscribeResult.isOk()) {
            const stream = subscribeResult.value;
            
            const self = this;
            async function* generator() {
              for await (const event of stream) {
                const enrichedEvent = await self.enrichEvent(event);
                if (enrichedEvent) {
                  yield enrichedEvent;
                }
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

    switch (eventType) {
      case HubEventType.MERGE_MESSAGE:
        return this.handleMergeMessage(rawEvent, id, time);
      
      case HubEventType.PRUNE_MESSAGE:
        return this.handlePruneMessage(rawEvent, id, time);
      
      case HubEventType.REVOKE_MESSAGE:
        return this.handleRevokeMessage(rawEvent, id, time);
      
      default:
        const fid = this.extractFidFromAnyEvent(rawEvent);
        if (fid === 0) {
          return null;
        }
        
        const username = await this.farcasterApi.getUsernameByFid(fid);
        return {
          id,
          username,
          content: `Event type ${eventType}`,
          link: `/events/${id}`,
          time,
          type: 'message'
        };
    }
  }

  private async handleMergeMessage(rawEvent: any, id: string, time: string): Promise<EnrichedEvent> {
    const messageData = rawEvent.mergeMessageBody?.message?.data;
    if (!messageData) {
      return this.createFallbackEvent(id, time, 'Invalid merge message');
    }
    
    const fid = messageData.fid || 0;
    const username = await this.farcasterApi.getUsernameByFid(fid);
    return this.processMessageEvent(rawEvent, messageData, fid, username, id, time);
  }

  private async handlePruneMessage(rawEvent: any, id: string, time: string): Promise<EnrichedEvent> {
    const messageData = rawEvent.pruneMessageBody?.message?.data;
    const fid = messageData?.fid || 0;
    const username = await this.farcasterApi.getUsernameByFid(fid);
    
    return {
      id,
      username,
      content: 'Message pruned',
      link: `/events/${id}`,
      time,
      type: 'prune'
    };
  }

  private async handleRevokeMessage(rawEvent: any, id: string, time: string): Promise<EnrichedEvent> {
    const messageData = rawEvent.revokeMessageBody?.message?.data;
    const fid = messageData?.fid || 0;
    const username = await this.farcasterApi.getUsernameByFid(fid);
    
    return {
      id,
      username,
      content: 'Message revoked',
      link: `/events/${id}`,
      time,
      type: 'revoke'
    };
  }

  private extractFidFromAnyEvent(rawEvent: any): number {
    return rawEvent.mergeMessageBody?.message?.data?.fid ||
           rawEvent.pruneMessageBody?.message?.data?.fid ||
           rawEvent.revokeMessageBody?.message?.data?.fid ||
           0;
  }

  private createFallbackEvent(id: string, time: string, content: string): EnrichedEvent {
    return {
      id,
      username: '0',
      content,
      link: `/events/${id}`,
      time,
      type: 'unknown'
    };
  }

  private async processMessageEvent(rawEvent: any, messageData: any, fid: number, username: string, id: string, time: string): Promise<EnrichedEvent> {
    let messageHash = null;
    const message = rawEvent.mergeMessageBody?.message;
    
    if (message?.hash?.data && Array.isArray(message.hash.data)) {
      messageHash = '0x' + Buffer.from(message.hash.data).toString('hex');
    } else if (message?.hash?.data && message.hash.data.type === 'Buffer') {
      messageHash = '0x' + Buffer.from(message.hash.data.data).toString('hex');
    } else if (message?.hash && Array.isArray(message.hash)) {
      messageHash = '0x' + Buffer.from(message.hash).toString('hex');
    }

    switch (messageData.type) {
      case 1: // Cast
        const castText = messageData.castAddBody?.text || 'Empty cast';
        const hasEmbeds = messageData.castAddBody?.embeds?.length > 0;
        const castLink = messageHash 
          ? `${this.nodeUrl}/v1/castById?fid=${fid}&hash=${messageHash}`
          : `${this.nodeUrl}/v1/eventById?event_id=${id}&shard_index=1`;
        
        return {
          id,
          username,
          content: castText,
          link: castLink,
          time,
          type: 'cast',
          embeds: hasEmbeds ? '+1' : undefined
        };

      case 3: // Reaction
        const reactionType = messageData.reactionBody?.type === 1 ? '❤️' : '🔄';
        const targetFid = messageData.reactionBody?.targetCastId?.fid || 0;
        const targetUsername = await this.farcasterApi.getUsernameByFid(targetFid);
        
        return {
          id,
          username,
          content: `${reactionType} ${targetUsername}'s cast`,
          link: `${this.nodeUrl}/v1/eventById?event_id=${id}&shard_index=1`,
          time,
          type: 'reaction'
        };

      case 5: // Follow
        const targetFid2 = messageData.linkBody?.targetFid || 0;
        const targetUsername2 = await this.farcasterApi.getUsernameByFid(targetFid2);
        const linkType = messageData.linkBody?.type || 'follow';
        
        return {
          id,
          username,
          content: `${linkType}ed ${targetUsername2}`,
          link: `${this.nodeUrl}/v1/linksByFid?fid=${fid}`,
          time,
          type: 'follow'
        };

      default:
        return {
          id,
          username,
          content: `Message type ${messageData.type}`,
          link: `/events/${id}`,
          time,
          type: 'message'
        };
    }
  }
}
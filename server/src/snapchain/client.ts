import { HubEventType, getSSLHubRpcClient } from '@farcaster/hub-nodejs';
import { getSnapchainHttpUrl, getSnapchainGrpcHost } from 'shared/dist/index.js';
import type { SubscribeRequest, EnrichedEvent } from './types';
import { EventEnricher } from './enricher';
import { delay } from './utils';

export class SnapchainClient {
  private static clientInstance: ReturnType<typeof getSSLHubRpcClient> | null = null;
  private static enricherInstance: EventEnricher | null = null;
  private nodeUrl: string;
  
  constructor(nodeUrl?: string) {
    this.nodeUrl = getSnapchainHttpUrl(nodeUrl);
    
    if (!SnapchainClient.clientInstance) {
      const grpcHost = getSnapchainGrpcHost(nodeUrl);
      const isProduction = process.env.NODE_ENV === 'production';
      
      SnapchainClient.clientInstance = getSSLHubRpcClient(grpcHost, {
        'grpc.keepalive_time_ms': isProduction ? 30000 : 15000,
        'grpc.keepalive_timeout_ms': isProduction ? 10000 : 3000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': isProduction ? 15000 : 5000,
        'grpc.http2.min_ping_interval_without_data_ms': isProduction ? 300000 : 150000,
        'grpc.max_receive_message_length': 1024 * 1024 * 4,
        'grpc.max_send_message_length': 1024 * 1024 * 4,
        'grpc.so_reuseport': 1,
        'grpc.use_local_subchannel_pool': 1,
        'grpc.max_connection_idle_ms': isProduction ? 60000 : 30000,
        'grpc.max_connection_age_ms': isProduction ? 300000 : 120000,
        'grpc.initial_reconnect_backoff_ms': 1000,
        'grpc.max_reconnect_backoff_ms': isProduction ? 30000 : 10000
      });
    }
    
    if (!SnapchainClient.enricherInstance) {
      SnapchainClient.enricherInstance = new EventEnricher();
    }
  }
  
  private get client() {
    return SnapchainClient.clientInstance!;
  }
  
  private get enricher() {
    return SnapchainClient.enricherInstance!;
  }

  async subscribe(request: SubscribeRequest): Promise<AsyncGenerator<EnrichedEvent, void, unknown>> {
    const self = this;
    const isProduction = process.env.NODE_ENV === 'production';
    
    async function* generator() {
      let retryCount = 0;
      const maxRetries = isProduction ? 2 : 3;
      
      while (retryCount < maxRetries) {
        try {
          // Add connection timeout
          const subscribePromise = self.client.subscribe({
            eventTypes: request.eventTypes || [HubEventType.MERGE_MESSAGE],
            fromId: request.fromId || 0,
            shardIndex: request.shardIndex || 1,
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Subscribe timeout')), isProduction ? 8000 : 5000);
          });
          
          const subscribeResult = await Promise.race([subscribePromise, timeoutPromise]) as any;

          if (subscribeResult.isOk()) {
            const stream = subscribeResult.value;
            retryCount = 0;
            
            let eventCount = 0;
            const startTime = Date.now();
            
            for await (const event of stream) {
              try {
                // In production, limit processing time per event
                if (isProduction && Date.now() - startTime > 300000) { // 5 minutes max
                  break;
                }
                
                const enrichedEvent = await self.enricher.enrichEvent(event);
                if (enrichedEvent) {
                  yield enrichedEvent;
                  eventCount++;
                  
                  // Add small delay in production to prevent overwhelming
                  if (isProduction && eventCount % 10 === 0) {
                    await delay(100);
                  }
                }
              } catch (enrichError) {
                continue;
              }
            }
          } else {
            throw new Error(`Subscribe failed: ${subscribeResult.error}`);
          }
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error(`Connection failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), isProduction ? 10000 : 5000);
          await delay(backoffDelay);
        }
      }
    }
    
    return generator();
  }
}

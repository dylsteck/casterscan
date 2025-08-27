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
      
      // More aggressive settings for production to handle Fly.io environment
      SnapchainClient.clientInstance = getSSLHubRpcClient(grpcHost, {
        'grpc.keepalive_time_ms': isProduction ? 20000 : 15000,
        'grpc.keepalive_timeout_ms': isProduction ? 5000 : 3000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': isProduction ? 10000 : 5000,
        'grpc.http2.min_ping_interval_without_data_ms': isProduction ? 120000 : 150000,
        'grpc.max_receive_message_length': 1024 * 1024 * 2,
        'grpc.max_send_message_length': 1024 * 1024 * 2,
        'grpc.so_reuseport': 1,
        'grpc.use_local_subchannel_pool': 0, // Disable for production
        'grpc.max_connection_idle_ms': isProduction ? 30000 : 30000,
        'grpc.max_connection_age_ms': isProduction ? 120000 : 120000,
        'grpc.initial_reconnect_backoff_ms': isProduction ? 2000 : 1000,
        'grpc.max_reconnect_backoff_ms': isProduction ? 15000 : 10000,
        'grpc.enable_retries': 1,
        'grpc.per_rpc_retry_buffer_size': 1024 * 1024
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
      const maxRetries = isProduction ? 1 : 3; // Reduce retries in production
      
      while (retryCount < maxRetries) {
        try {
          // Shorter timeout in production
          const subscribePromise = self.client.subscribe({
            eventTypes: request.eventTypes || [HubEventType.MERGE_MESSAGE],
            fromId: request.fromId || 0,
            shardIndex: request.shardIndex || 1,
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Subscribe timeout')), isProduction ? 3000 : 5000);
          });
          
          const subscribeResult = await Promise.race([subscribePromise, timeoutPromise]) as any;

          if (subscribeResult.isOk()) {
            const stream = subscribeResult.value;
            retryCount = 0;
            
            let eventCount = 0;
            const startTime = Date.now();
            const maxStreamTime = isProduction ? 120000 : 300000; // 2 minutes in prod, 5 in dev
            
            for await (const event of stream) {
              try {
                // Break connection after max time to prevent hanging
                if (Date.now() - startTime > maxStreamTime) {
                  break;
                }
                
                const enrichedEvent = await self.enricher.enrichEvent(event);
                if (enrichedEvent) {
                  yield enrichedEvent;
                  eventCount++;
                  
                  // Limit events per stream in production
                  if (isProduction && eventCount >= 50) {
                    break;
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
          
          const backoffDelay = Math.min(1000 * retryCount, isProduction ? 3000 : 5000);
          await delay(backoffDelay);
        }
      }
    }
    
    return generator();
  }
}

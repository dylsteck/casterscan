import { HubEventType, getSSLHubRpcClient } from '@farcaster/hub-nodejs';
import { getSnapchainHttpUrl, getSnapchainGrpcHost, ALTERNATIVE_SNAPCHAIN_ENDPOINTS } from 'shared/dist/index.js';
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

    console.log(`🌐 Snapchain HTTP: ${this.nodeUrl}`);
    console.log(`🔗 Snapchain gRPC: ${grpcHost}`);
    console.log(`🐳 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Platform: ${process.platform}`);
    console.log(`🚂 Railway detected: ${this.isRailwayEnvironment()}`);
    console.log(`🪰 Fly.io detected: ${this.isFlyEnvironment()}`);

    // Enhanced gRPC configuration for production environments
    if (this.isFlyEnvironment() || process.env.NODE_ENV === 'production') {
      console.log('🪰 Production/Fly.io detected - using optimized gRPC configuration...');
      
      const productionGrpcOptions = {
        // Connection settings
        'grpc.keepalive_time_ms': 30000,
        'grpc.keepalive_timeout_ms': 10000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': 10000,
        'grpc.http2.min_ping_interval_without_data_ms': 300000,
        
        // SSL/TLS settings
        'grpc.ssl_target_name_override': 'snap.farcaster.xyz',
        'grpc.default_authority': 'snap.farcaster.xyz',
        
        // Connection reliability
        'grpc.enable_http_proxy': 0,
        'grpc.enable_channelz': 1,
        'grpc.max_receive_message_length': 4194304,
        'grpc.max_send_message_length': 4194304,
        
        // Retry settings
        'grpc.initial_reconnect_backoff_ms': 1000,
        'grpc.max_reconnect_backoff_ms': 30000,
        'grpc.service_config': JSON.stringify({
          methodConfig: [{
            name: [{}],
            retryPolicy: {
              maxAttempts: 3,
              initialBackoff: '1s',
              maxBackoff: '10s',
              backoffMultiplier: 2,
              retryableStatusCodes: ['UNAVAILABLE', 'DEADLINE_EXCEEDED']
            }
          }]
        })
      };
      
      this.client = getSSLHubRpcClient(grpcHost, productionGrpcOptions);
      console.log('✅ Production-optimized gRPC client created');
    } else {
      this.client = getSSLHubRpcClient(grpcHost);
    }
    this.farcasterApi = new FarcasterApiClient();
  }

  /**
   * Detect if we're running on Railway
   */
  private isRailwayEnvironment(): boolean {
    return !!(
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID ||
      process.env.RAILWAY_DEPLOYMENT_ID
    );
  }

  /**
   * Detect if we're running on Fly.io
   */
  private isFlyEnvironment(): boolean {
    return !!(
      process.env.FLY_APP_NAME ||
      process.env.FLY_REGION ||
      process.env.FLY_MACHINE_ID ||
      process.env.FLY_ALLOC_ID
    );
  }

  /**
   * Test HTTP connectivity to Snapchain before attempting gRPC
   */
  private async testHttpConnectivity(): Promise<boolean> {
    try {
      console.log(`🌐 Testing HTTP connectivity to: ${this.nodeUrl}`);
      const response = await fetch(`${this.nodeUrl}/v1/info`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        console.log('✅ HTTP connectivity test passed');
        return true;
      } else {
        console.log(`⚠️ HTTP test failed with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ HTTP connectivity test failed:`, error instanceof Error ? error.message : error);
      return false;
    }
  }

  /**
   * HTTP fallback: Poll for recent casts when gRPC fails
   */
  private async *httpFallbackStream(request: SubscribeRequest): AsyncGenerator<EnrichedEvent, void, unknown> {
    console.log('⚡ Using HTTP fallback...');
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailway = this.isRailwayEnvironment();
    
    // For Railway/production, prioritize Neynar API as it's more reliable
    if (isRailway || isProduction) {
      console.log(`${isRailway ? '🚂 Railway' : '🔄 Production'} detected - trying Neynar API as primary`);
      try {
        // Quick test of Snapchain HTTP with shorter timeout
        const testResponse = await fetch(`${this.nodeUrl}/v1/castsByFid?fid=1&pageSize=1`, {
          signal: AbortSignal.timeout(1500) // Shorter timeout for Railway
        });
        if (!testResponse.ok) {
          console.log('📡 Snapchain HTTP failed, using Neynar API');
          yield* this.neynarFallbackStream();
          return;
        }
        console.log('✅ Snapchain HTTP available, using hybrid approach');
      } catch (e) {
        console.log('📡 Snapchain HTTP failed, using Neynar API');
        yield* this.neynarFallbackStream();
        return;
      }
    }
    
    console.log('📍 Platform:', process.platform);
    console.log('🔗 Polling URL:', this.nodeUrl);
    
    let seenHashes = new Set<string>();
    let lastTimestamp = Math.floor(Date.now() / 1000) - 60; // Start 1 minute ago for fresher content
    let pollCount = 0;
    
    // Use more popular/active FIDs for better content
    const activeFids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                       21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 616, 3621, 2, 194, 239, 1689, 99, 13242];
    
    let fidIndex = 0;
    
    while (true) {
      try {
        pollCount++;
        console.log(`🔄 Poll #${pollCount} - Fetching from ${this.nodeUrl}`);
        
        // Aggressive parallel polling - 20 FIDs at once with larger page sizes
        const currentBatch = activeFids.slice(fidIndex, fidIndex + 20);
        fidIndex = (fidIndex + 20) % activeFids.length;
        
        console.log(`📊 Polling FIDs: ${currentBatch.slice(0, 5).join(', ')}... (${currentBatch.length} total)`);
        
        const promises = currentBatch.map(async (fid) => {
          try {
            const url = `${this.nodeUrl}/v1/castsByFid?fid=${fid}&pageSize=15`;
            if (pollCount === 1 && fid === currentBatch[0]) {
              console.log(`🔗 Fetching: ${url}`);
            }
            
            const response = await fetch(url, {
              signal: AbortSignal.timeout(5000), // Increased timeout for Railway
              headers: {
                'User-Agent': 'CasterScan/1.0',
                'Accept': 'application/json'
              }
            });
            if (response.ok) {
              const data = await response.json() as any;
              return { fid, messages: data.messages || [], success: true };
            } else {
              console.log(`⚠️ HTTP ${response.status} for FID ${fid}`);
              return { fid, messages: [], success: false };
            }
          } catch (e) {
            console.log(`❌ Fetch failed for FID ${fid}:`, e instanceof Error ? e.message : e);
            return { fid, messages: [], success: false };
          }
        });
        
        const results = await Promise.all(promises);
        const successCount = results.filter(r => r.success).length;
        console.log(`📡 Poll results: ${successCount}/${results.length} successful requests`);
        
        const newEvents: EnrichedEvent[] = [];
        
        // Process all messages in parallel
        for (const { fid, messages } of results) {
          for (const message of messages) {
            const hash = message.hash;
            const messageTimestamp = message.data?.timestamp || 0;
            
            // Only process newer messages and avoid duplicates
            if (!seenHashes.has(hash) && messageTimestamp > lastTimestamp) {
              seenHashes.add(hash);
              lastTimestamp = Math.max(lastTimestamp, messageTimestamp);
              
              // Create enriched event from cast message
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
        
        // Sort by timestamp (newest first) and yield immediately
        newEvents.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
        // Yield events IMMEDIATELY without username resolution for speed
        if (newEvents.length > 0) {
          console.log(`🎉 Found ${newEvents.length} new events!`);
          for (const event of newEvents) {
            yield event;
            console.log(`⚡ Super Fast HTTP Event: ${event.type} by ${event.username}`);
          }
        }
        
        // Resolve usernames in background (don't wait for this)
        if (newEvents.length > 0) {
          Promise.all(newEvents.map(async (event) => {
            if (event.username.startsWith('fid-')) {
              const fidNum = parseInt(event.username.replace('fid-', ''));
              try {
                const realUsername = await this.farcasterApi.getUsernameByFid(fidNum);
                // Username resolution happens async, won't update already yielded events
                console.log(`📛 Resolved: fid-${fidNum} -> ${realUsername}`);
              } catch (e) {
                // Silently fail
              }
            }
          })).catch(() => {}); // Background resolution, ignore errors
        }
        
        // More aggressive cleanup
        if (seenHashes.size > 1000) {
          const oldSize = seenHashes.size;
          seenHashes.clear();
          lastTimestamp = Math.floor(Date.now() / 1000) - 30; // Reset to 30 seconds ago
          console.log(`🧹 Fast cleanup: ${oldSize} hashes cleared`);
        }
        
      } catch (error) {
        console.log('⚠️ HTTP polling error:', error instanceof Error ? error.message : error);
      }
      
      // Super fast polling - every 300ms for near real-time
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  /**
   * Neynar API fallback for production
   */
  private async *neynarFallbackStream(): AsyncGenerator<EnrichedEvent, void, unknown> {
    console.log('🔄 Using Neynar API fallback...');
    let seenHashes = new Set<string>();
    let pollCount = 0;
    
    // Popular FIDs for better content
    const activeFids = [1, 2, 3, 616, 3621, 194, 239, 1689, 99, 13242, 5, 6, 7, 8, 9, 10];
    
    while (true) {
      try {
        pollCount++;
        console.log(`🔄 Neynar Poll #${pollCount}`);
        
        // Get recent casts from multiple users using Neynar
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
              console.log(`⚠️ Neynar HTTP ${response.status} for FID ${fid}`);
              return { fid, casts: [], success: false };
            }
          } catch (e) {
            console.log(`❌ Neynar fetch failed for FID ${fid}:`, e instanceof Error ? e.message : e);
            return { fid, casts: [], success: false };
          }
        });
        
        const results = await Promise.all(promises);
        const successCount = results.filter(r => r.success).length;
        console.log(`📡 Neynar results: ${successCount}/${results.length} successful requests`);
        
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
        
        // Sort by timestamp and yield
        newEvents.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
        if (newEvents.length > 0) {
          console.log(`🎉 Found ${newEvents.length} new Neynar events!`);
          for (const event of newEvents) {
            yield event;
            console.log(`⚡ Neynar Event: ${event.username} - ${event.content.substring(0, 30)}...`);
          }
        }
        
        // Cleanup seen hashes
        if (seenHashes.size > 500) {
          seenHashes.clear();
          console.log('🧹 Cleared Neynar hash cache');
        }
        
      } catch (error) {
        console.log('⚠️ Neynar polling error:', error instanceof Error ? error.message : error);
      }
      
      // Poll every 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  /**
   * Dedicated gRPC connection method for Fly.io with proper SSL configuration
   */
  private async tryFlyGrpcConnection(request: SubscribeRequest): Promise<AsyncGenerator<EnrichedEvent, void, unknown>> {
    console.log('🪰 Starting enhanced Fly.io gRPC connection attempt...');
    
    const grpcHost = 'snap.farcaster.xyz:3383';
    console.log(`🔗 Connecting to: ${grpcHost}`);
    
    // Production-grade gRPC client settings for Fly.io
    const flyGrpcOptions = {
      // Enhanced keepalive settings
      'grpc.keepalive_time_ms': 20000,
      'grpc.keepalive_timeout_ms': 5000,
      'grpc.keepalive_permit_without_calls': 1,
      'grpc.http2.max_pings_without_data': 0,
      'grpc.http2.min_time_between_pings_ms': 5000,
      'grpc.http2.min_ping_interval_without_data_ms': 120000,
      
      // SSL/TLS configuration
      'grpc.ssl_target_name_override': 'snap.farcaster.xyz',
      'grpc.default_authority': 'snap.farcaster.xyz',
      
      // Connection reliability
      'grpc.enable_http_proxy': 0,
      'grpc.enable_channelz': 1,
      'grpc.max_receive_message_length': 8388608, // 8MB
      'grpc.max_send_message_length': 8388608,
      
      // Enhanced retry configuration
      'grpc.initial_reconnect_backoff_ms': 500,
      'grpc.max_reconnect_backoff_ms': 15000,
      'grpc.service_config': JSON.stringify({
        methodConfig: [{
          name: [{}],
          retryPolicy: {
            maxAttempts: 5,
            initialBackoff: '0.5s',
            maxBackoff: '5s',
            backoffMultiplier: 1.5,
            retryableStatusCodes: ['UNAVAILABLE', 'DEADLINE_EXCEEDED', 'RESOURCE_EXHAUSTED']
          }
        }]
      }),
      
      // Additional production settings
      'grpc.dns_resolution_timeout': 10000,
      'grpc.client_idle_timeout_ms': 300000
    };
    
    const flyClient = getSSLHubRpcClient(grpcHost, flyGrpcOptions);

    return new Promise<AsyncGenerator<EnrichedEvent, void, unknown>>((resolve, reject) => {
      const timeout = 30000; // Extended timeout for production reliability
      const deadline = Date.now() + timeout;

      console.log(`🪰 Waiting for gRPC ready state (timeout: ${timeout}ms)...`);
      console.log('🔍 Connection attempt details:', {
        environment: process.env.NODE_ENV,
        platform: process.platform,
        flyRegion: process.env.FLY_REGION,
        timestamp: new Date().toISOString()
      });

      (flyClient as any).$.waitForReady(deadline, async (e: any) => {
        if (e) {
          console.error('❌ Fly.io gRPC connection failed:', e.message || e);
          console.error('🔍 gRPC Error details:', {
            code: e.code,
            details: e.details,
            metadata: e.metadata?.toJSON?.() || e.metadata
          });
          console.log('🔄 Falling back to HTTP polling on Fly.io...');
          resolve(this.httpFallbackStream(request));
          return;
        }

        console.log('✅ Fly.io gRPC connection established successfully!');

        try {
          console.log('🔄 Starting gRPC subscription...');
          const subscribeResult = await flyClient.subscribe({
            eventTypes: request.eventTypes || [1, 2, 3], // MERGE_MESSAGE, PRUNE_MESSAGE, REVOKE_MESSAGE
            fromId: request.fromId,
            shardIndex: request.shardIndex || 1,
          });

          if (subscribeResult.isOk()) {
            const stream = subscribeResult.value;
            console.log('🎉 gRPC subscription successful on Fly.io!');

            const self = this;
            async function* generator() {
              try {
                for await (const event of stream) {
                  console.log('📡 Received gRPC event on Fly.io:', event.type);
                  const enrichedEvent = await self.enrichEvent(event);
                  if (enrichedEvent) {
                    console.log('✨ Yielding enriched event:', enrichedEvent.type, enrichedEvent.username);
                    yield enrichedEvent;
                  }
                }
              } catch (streamError) {
                console.error('❌ gRPC stream error on Fly.io:', streamError);
                // Don't throw, just end the stream
              }
            }

            resolve(generator());
          } else {
            console.error('❌ Fly.io gRPC subscription failed:', subscribeResult.error);
            console.log('🔄 Falling back to HTTP polling...');
            resolve(this.httpFallbackStream(request));
          }
        } catch (subscriptionError) {
          console.error('❌ Fly.io gRPC subscription error:', subscriptionError);
          console.log('🔄 Falling back to HTTP polling...');
          resolve(this.httpFallbackStream(request));
        }
      });
    });
  }

  /**
   * Aggressive retry mechanism specifically for Fly.io production (legacy - now using tryFlyGrpcConnection)
   */
  private tryGrpcConnectionWithRetry(request: SubscribeRequest, resolve: (value: AsyncGenerator<EnrichedEvent, void, unknown>) => void, reject: (reason: any) => void): void {
    const baseConfig = {
      'grpc.keepalive_permit_without_calls': 1,
      'grpc.http2.max_pings_without_data': 0,
      'grpc.enable_http_proxy': 0,
      'grpc.initial_reconnect_backoff_ms': 500,
      'grpc.max_reconnect_backoff_ms': 3000
    };

    const strategies = [
      // Try different endpoints with different configurations
      ...ALTERNATIVE_SNAPCHAIN_ENDPOINTS.flatMap(endpoint => [
        {
          name: `Endpoint: ${endpoint} - Relaxed SSL`,
          endpoint,
          config: {
            ...baseConfig,
            'grpc.keepalive_time_ms': 5000,
            'grpc.keepalive_timeout_ms': 2000,
            'grpc.http2.min_time_between_pings_ms': 2000,
            'grpc.ssl_target_name_override': endpoint.split(':')[0],
            'grpc.default_authority': endpoint.split(':')[0]
          },
          timeout: 8000
        },
        {
          name: `Endpoint: ${endpoint} - Aggressive SSL`,
          endpoint,
          config: {
            ...baseConfig,
            'grpc.keepalive_time_ms': 1000,
            'grpc.keepalive_timeout_ms': 1000,
            'grpc.http2.min_time_between_pings_ms': 1000,
            'grpc.ssl_target_name_override': endpoint.split(':')[0],
            'grpc.default_authority': endpoint.split(':')[0]
          },
          timeout: 12000
        }
      ])
    ];

    let strategyIndex = 0;

    const tryNextStrategy = () => {
      if (strategyIndex >= strategies.length) {
        console.log('🪰 All gRPC strategies and endpoints failed on Fly.io - falling back to HTTP polling');
        resolve(this.httpFallbackStream(request));
        return;
      }

      const strategy = strategies[strategyIndex++];
      if (!strategy) {
        console.log('🪰 Strategy is undefined, falling back to HTTP polling');
        resolve(this.httpFallbackStream(request));
        return;
      }

      console.log(`🪰 Fly.io Strategy ${strategyIndex}/${strategies.length}: ${strategy.name}`);

      // Create new client with this strategy and endpoint
      const client = getSSLHubRpcClient(strategy.endpoint, strategy.config);
      const deadline = Date.now() + strategy.timeout;

      (client as any).$.waitForReady(deadline, async (e: any) => {
        if (e) {
          console.error(`❌ Strategy ${strategyIndex} (${strategy.endpoint}) failed:`, e.message || e);
          console.error('🔍 Error details:', {
            code: e.code,
            details: e.details,
            metadata: e.metadata,
            stack: e.stack?.substring(0, 200)
          });
          tryNextStrategy();
          return;
        }

        console.log(`✅ Fly.io gRPC connection successful with strategy: ${strategy.name}`);

        try {
          const subscribeResult = await client.subscribe({
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
            console.error('Subscription failed:', subscribeResult.error);
            tryNextStrategy();
          }
        } catch (error) {
          console.error('Fly.io gRPC subscription error:', error);
          tryNextStrategy();
        }
      });
    };

    tryNextStrategy();
  }

  /**
   * Subscribe to real-time events from Snapchain using gRPC (with HTTP fallback)
   */
  async subscribe(request: SubscribeRequest): Promise<AsyncGenerator<EnrichedEvent, void, unknown>> {
    const isRailway = this.isRailwayEnvironment();
    const isFly = this.isFlyEnvironment();
    const isProduction = process.env.NODE_ENV === 'production';
    
      // Skip gRPC entirely on Railway and Fly.io production since it doesn't work reliably
  if (isRailway) {
    console.log('🚂 Railway environment detected - skipping gRPC, using HTTP fallback directly');
    console.log('💡 Railway demultiplexes HTTP/2 to HTTP/1.1, breaking gRPC compatibility');
    return this.httpFallbackStream(request);
  }
  
  // For Fly.io environments, try gRPC first with enhanced configuration
  if (isFly) {
    console.log(`🪰 Fly.io environment detected (production: ${isProduction})`);
    console.log('🔄 Attempting enhanced gRPC connection with production-grade settings');
    console.log(`🌐 Environment details - NODE_ENV: ${process.env.NODE_ENV || 'undefined'}, Platform: ${process.platform}`);
    return this.tryFlyGrpcConnection(request);
  }
    
    // Test HTTP connectivity (non-blocking - just for info)
    this.testHttpConnectivity().then(connected => {
      console.log(`🌐 HTTP connectivity: ${connected ? '✅ OK' : '❌ Failed'}`);
    }).catch(() => {});
    
    // Try gRPC in non-Railway environments
    console.log('🔗 Attempting gRPC connection (non-Railway environment)');
    
    return new Promise<AsyncGenerator<EnrichedEvent, void, unknown>>((resolve, reject) => {
      // Standard connection for local/dev environments
      const timeout = isProduction ? 5000 : 8000;
      const deadline = Date.now() + timeout;

      console.log(`🔗 Attempting gRPC connection to: ${getSnapchainGrpcHost(this.nodeUrl)} (timeout: ${timeout}ms)`);

      (this.client as any).$.waitForReady(deadline, async (e: any) => {
        if (e) {
          console.error('❌ gRPC connection failed:', e.message || e);
          console.error('🔍 Error details:', {
            code: e.code,
            details: e.details,
            metadata: e.metadata,
            stack: e.stack?.substring(0, 200)
          });
          console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
          console.log('📍 Platform:', process.platform);
          console.log('🔄 Falling back to HTTP polling...');

          // Return HTTP fallback stream instead of rejecting
          resolve(this.httpFallbackStream(request));
          return;
        }

        console.log('✅ gRPC connection established to Snapchain');

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
            reject(new Error(`Subscription failed: ${subscribeResult.error}`));
          }
        } catch (error) {
          console.error('Snapchain gRPC subscription error:', error);
          reject(error);
        }
      });
    });
  }

  private getHumanReadableEventType(eventType: HubEventType): string {
    switch (eventType) {
      case HubEventType.MERGE_MESSAGE:
        return 'merge';
      case HubEventType.PRUNE_MESSAGE:
        return 'prune';
      case HubEventType.REVOKE_MESSAGE:
        return 'revoke';
      case HubEventType.MERGE_USERNAME_PROOF:
        return 'username';
      case HubEventType.MERGE_ON_CHAIN_EVENT:
        return 'onchain';
      default:
        return 'unknown';
    }
  }

  /**
   * Enrich raw events into human-readable format
   */
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
      
      case HubEventType.MERGE_USERNAME_PROOF:
        return this.handleUsernameProof(rawEvent, id, time);
      
      case HubEventType.MERGE_ON_CHAIN_EVENT:
        return this.handleOnChainEvent(rawEvent, id, time);
      
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
          type: this.getHumanReadableEventType(eventType)
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

  private async handleUsernameProof(rawEvent: any, id: string, time: string): Promise<EnrichedEvent> {
    const fid = rawEvent.mergeUserNameProofBody?.usernameProof?.fid || 0;
    const username = await this.farcasterApi.getUsernameByFid(fid);
    
    return {
      id,
      username,
      content: 'Username proof updated',
      link: `/events/${id}`,
      time,
      type: 'username'
    };
  }

  private async handleOnChainEvent(rawEvent: any, id: string, time: string): Promise<EnrichedEvent> {
    const fid = rawEvent.mergeOnChainEventBody?.onChainEvent?.fid || 0;
    const username = await this.farcasterApi.getUsernameByFid(fid);
    
    return {
      id,
      username,
      content: 'On-chain event',
      link: `https://snap.farcaster.xyz:3381/v1/info`,
      time,
      type: 'onchain'
    };
  }

  private extractFidFromAnyEvent(rawEvent: any): number {
    return rawEvent.mergeMessageBody?.message?.data?.fid ||
           rawEvent.pruneMessageBody?.message?.data?.fid ||
           rawEvent.revokeMessageBody?.message?.data?.fid ||
           rawEvent.mergeUserNameProofBody?.usernameProof?.fid ||
           rawEvent.mergeOnChainEventBody?.onChainEvent?.fid ||
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
    // Extract message hash - it's usually in the hash.data field as a Buffer/Array
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
        // For casts, we must use castById with the specific hash
        const castLink = messageHash 
          ? `${this.nodeUrl}/v1/castById?fid=${fid}&hash=${messageHash}`
          : `${this.nodeUrl}/v1/eventById?event_id=${id}&shard_index=1`; // Fallback if no hash available
        
        return {
          id,
          username,
          content: castText,
          link: castLink,
          time,
          type: 'cast',
          embeds: hasEmbeds ? '+1' : undefined
        };

      case 3:
        const reactionType = messageData.reactionBody?.type === 1 ? '❤️' : '🔄';
        const targetFid = messageData.reactionBody?.targetCastId?.fid || 0;
        const targetHash = messageData.reactionBody?.targetCastId?.hash;
        const targetUsername = await this.farcasterApi.getUsernameByFid(targetFid);
        
        // Extract target hash as hex string
        let targetHashHex = null;
        if (targetHash) {
          if (Array.isArray(targetHash)) {
            targetHashHex = '0x' + Buffer.from(targetHash).toString('hex');
          } else if (targetHash.type === 'Buffer') {
            targetHashHex = '0x' + Buffer.from(targetHash.data).toString('hex');
          }
        }
        
        const reactionTypeStr = messageData.reactionBody?.type === 1 ? 'Like' : 'Recast';
        const reactionLink = targetHashHex 
          ? `${this.nodeUrl}/v1/reactionById?fid=${fid}&reaction_type=${reactionTypeStr}&target_fid=${targetFid}&target_hash=${targetHashHex}`
          : `${this.nodeUrl}/v1/eventById?event_id=${id}&shard_index=1`;
        
        return {
          id,
          username,
          content: `${reactionType} ${targetUsername}'s cast`,
          link: reactionLink,
          time,
          type: 'reaction'
        };

      case 5:
        const targetFid2 = messageData.linkBody?.targetFid || 0;
        const targetUsername2 = await this.farcasterApi.getUsernameByFid(targetFid2);
        const linkType = messageData.linkBody?.type || 'follow';
        const followLink = `${this.nodeUrl}/v1/linksByFid?fid=${fid}`;
        
        return {
          id,
          username,
          content: `${linkType}ed ${targetUsername2}`,
          link: followLink,
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

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { stream } from 'hono/streaming'
import { serveStatic } from 'hono/bun'
import type { ApiResponse } from 'shared/dist'
import { getSnapchainHttpUrl } from 'shared/dist'
import { SnapchainClient, type SubscribeRequest } from './snapchain'
import { getSSLHubRpcClient, getInsecureHubRpcClient, HubEventType } from '@farcaster/hub-nodejs'
import { NeynarService } from './neynar'

const app = new Hono()
const neynarService = new NeynarService()

app.use(cors())

app.get('/api', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Health check endpoint for Fly.io
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Debug endpoint to check stream connectivity
app.get('/api/debug/stream', async (c) => {
  const snapchain = new SnapchainClient();
  const startTime = Date.now();
  
  try {
    const eventStream = await snapchain.subscribe({
      eventTypes: [1, 2, 3],
      shardIndex: 1
    });
    
    const streamTest = eventStream[Symbol.asyncIterator]();
    const connectionTime = Date.now() - startTime;
    
    return c.json({
      status: 'stream_accessible',
      connectionTime,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        platform: process.platform,
        isFly: !!process.env.FLY_APP_NAME,
        hasNeynarKey: !!process.env.NEYNAR_API_KEY
      }
    });
  } catch (error) {
    return c.json({
      status: 'stream_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, 500);
  }
})

// Connectivity test endpoint
app.get('/api/debug/connectivity', async (c) => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as Record<string, any>
  };
  
  try {
    const httpStart = Date.now();
    const response = await fetch('https://snap.farcaster.xyz:3381/v1/info', {
      signal: AbortSignal.timeout(10000)
    });
    results.tests.farcaster_http = {
      success: response.ok,
      status: response.status,
      time: Date.now() - httpStart
    };
  } catch (error) {
    results.tests.farcaster_http = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
  
  try {
    const grpcStart = Date.now();
    const client = getSSLHubRpcClient('snap.farcaster.xyz:3383', {
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
    results.tests.grpc_client_creation = {
      success: true,
      time: Date.now() - grpcStart
    };
  } catch (error) {
    results.tests.grpc_client_creation = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
  
  return c.json(results);
})

app.get('/api/hello', async (c) => {

  const data: ApiResponse = {
    message: "Hello BHVR!",
    success: true
  }

  return c.json(data, { status: 200 })
})

app.get('/api/info', async (c) => {
  try {
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    const response = await fetch(`${nodeUrl}/v1/info`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return c.json(data as any)
  } catch (error) {
    return c.json({ error: 'Failed to fetch info' }, { status: 500 })
  }
})

app.get('/api/fids/:fid', async (c) => {
  try {
    const fid = c.req.param('fid')
    const user = await neynarService.getNeynarUser(fid)
    return c.json(user)
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
})

app.get('/api/fids/:fid/signers', async (c) => {
  try {
    const fid = c.req.param('fid')
    const pageSize = c.req.query('pageSize') || '1000'
    const pageToken = c.req.query('pageToken') || ''
    const reverse = c.req.query('reverse') || 'false'
    const signer = c.req.query('signer') || ''
    
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    let url = `${nodeUrl}/v1/onChainSignersByFid?fid=${fid}&pageSize=${pageSize}&reverse=${reverse}`
    if (pageToken) url += `&pageToken=${pageToken}`
    if (signer) url += `&signer=${signer}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return c.json(data as any)
  } catch (error) {
    return c.json({ error: 'Failed to fetch signers' }, { status: 500 })
  }
})

app.get('/api/casts/:hash', async (c) => {
  try {
    const hash = c.req.param('hash')
    const cast = await neynarService.getNeynarCast(hash, 'hash')
    return c.json(cast)
  } catch (error) {
    return c.json({ error: 'Failed to fetch cast' }, { status: 500 })
  }
})

// Handle CORS preflight for SSE
app.options('/api/events/stream', (c) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Cache-Control, X-Snapchain-Node')
  c.status(204)
  return c.body(null)
})

// Polling endpoint for recent events (works better than SSE on Fly.io)
app.get('/api/events/recent', async (c) => {
  const limit = parseInt(c.req.query('limit') || '20');
  const snapchain = new SnapchainClient();
  
  try {
    // Get recent events from HTTP polling
    const events: any[] = [];
    const eventStream = await snapchain.subscribe({
      eventTypes: [1, 2, 3], // MERGE_MESSAGE, PRUNE_MESSAGE, REVOKE_MESSAGE
      shardIndex: 1
    });

    // Collect events for 2 seconds
    const timeout = setTimeout(() => {}, 2000);
    let count = 0;
    
    for await (const event of eventStream) {
      events.push(event);
      count++;
      if (count >= limit) break;
      if (Date.now() - parseInt(timeout.toString()) > 2000) break;
    }
    
    return c.json({ events, count: events.length });
  } catch (error) {
    return c.json({ error: 'Failed to get recent events', events: [], count: 0 }, 500);
  }
});

// Server-Sent Events stream for real-time events
app.get('/api/events/stream', async (c) => {
  const encoder = new TextEncoder();
  
  const customReadable = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        type: 'connected',
        timestamp: new Date().toISOString()
      })}\n\n`));

      const startGrpcStream = async () => {
        let nodeClient: any = null;
        
        try {
          const hubRpcEndpoint = "snap.farcaster.xyz:3383";
          
          nodeClient = getSSLHubRpcClient(hubRpcEndpoint, {
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

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'ready',
            timestamp: new Date().toISOString()
          })}\n\n`));

          const subscribeResult = await nodeClient.subscribe({
            eventTypes: [HubEventType.MERGE_MESSAGE, HubEventType.PRUNE_MESSAGE, HubEventType.REVOKE_MESSAGE],
            fromId: 0
          });

          // Send ready event immediately to show we're attempting connection
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'ready',
            timestamp: new Date().toISOString()
          })}\n\n`));

          if (subscribeResult.isOk()) {
            const eventStream = subscribeResult.value;

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'streaming',
              timestamp: new Date().toISOString()
            })}\n\n`));

            // Set up periodic cast fetching as backup
            const seenHashes = new Set();
            const activeFids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 616, 3621, 194, 239, 1689, 99, 13242];
            
            const fetchRecentCasts = async () => {
              try {
                const randomFids = activeFids.sort(() => Math.random() - 0.5).slice(0, 3);
                
                for (const fid of randomFids) {
                  const response = await fetch(`https://snap.farcaster.xyz:3381/v1/castsByFid?fid=${fid}&pageSize=2`, {
                    signal: AbortSignal.timeout(3000)
                  });
                  
                  if (response.ok) {
                    const data = await response.json() as any;
                    
                    for (const message of data.messages || []) {
                      if (message.hash && message.data?.castAddBody?.text) {
                        const hash = message.hash;
                        
                        if (!seenHashes.has(hash)) {
                          seenHashes.add(hash);
                          
                          // Keep set size manageable
                          if (seenHashes.size > 50) {
                            const idsArray = Array.from(seenHashes);
                            seenHashes.clear();
                            idsArray.slice(-25).forEach(id => seenHashes.add(id));
                          }
                          
                          const eventData = {
                            type: 'cast',
                            id: hash,
                            fid: fid,
                            username: `fid${fid}`,
                            content: message.data.castAddBody.text,
                            timestamp: new Date(message.data.timestamp * 1000).toISOString(),
                            embeds: message.data.castAddBody.embeds?.length?.toString() || '0',
                            link: `/casts/${hash}`,
                            time: new Date(message.data.timestamp * 1000).toLocaleString()
                          };
                          
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
                        }
                      }
                    }
                  }
                }
              } catch (error) {
                // Silent fail for backup fetching
              }
            };
            
            // Fetch initial casts
            await fetchRecentCasts();
            
            // Set up periodic fetching every 5 seconds
            const fetchInterval = setInterval(fetchRecentCasts, 5000);
            
            // Process gRPC events (real-time when available)
            let eventCount = 0;
            for await (const event of eventStream) {
              eventCount++;
              
              try {
                if (event.type === HubEventType.MERGE_MESSAGE && event.mergeMessageBody?.message) {
                  const message = event.mergeMessageBody.message;
                  const messageData = message.data;
                  
                  // Check if it's a cast (type 1)
                  if (messageData?.type === 1 && messageData.castAddBody) {
                    const castBody = messageData.castAddBody;
                    const hash = Buffer.from(message.hash).toString('hex');
                    
                    // Only send if we haven't seen this cast from HTTP polling
                    if (!seenHashes.has(hash)) {
                      seenHashes.add(hash);
                      
                      const eventData = {
                        type: 'cast',
                        id: hash,
                        fid: Number(messageData.fid),
                        username: `fid${messageData.fid}`,
                        content: castBody.text || '',
                        timestamp: new Date(messageData.timestamp * 1000).toISOString(),
                        embeds: castBody.embeds?.length.toString() || '0',
                        link: `/casts/${hash}`,
                        time: new Date(messageData.timestamp * 1000).toLocaleString()
                      };

                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
                    }
                  }
                }
              } catch (eventError) {
                // Continue processing
              }
            }
            
            // Clean up interval if stream ends
            clearInterval(fetchInterval);
          } else {
            throw new Error(`Failed to subscribe: ${subscribeResult.error?.message || 'Unknown subscription error'}`);
          }

        } catch (error) {
          if (nodeClient) {
            try {
              nodeClient.close();
            } catch (closeError) {
              console.error('Error closing gRPC client:', closeError);
            }
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error',
            error: error instanceof Error ? error.message : 'gRPC connection failed',
            timestamp: new Date().toISOString()
          })}\n\n`));
          
          throw error;
        }
      };



      startGrpcStream().catch((error) => {
        console.error('Failed to start gRPC stream:', error);
        controller.error(error);
      });
    }
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no',
    },
  });
});

app.get('/api/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id')
    const shardIndex = c.req.query('shard_index') || '1'
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    const response = await fetch(`${nodeUrl}/v1/eventById?event_id=${eventId}&shard_index=${shardIndex}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const event = await response.json()
    return c.json(event as any)
  } catch (error) {
    return c.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
})

// Serve static files first
app.use("/assets/*", serveStatic({ root: "./static" }))
app.use("/favicon.ico", serveStatic({ root: "./static" }))
app.use("/vite.svg", serveStatic({ root: "./static" }))

// Catch-all for SPA routes - only for non-API, non-static routes
app.use("*", async (c, next) => {
  const path = c.req.path
  // Skip for API routes and static assets
  if (path.startsWith('/api/')) {
    return next()
  }
  // For all other routes, serve the SPA
  return serveStatic({ root: "./static", path: "index.html" })(c, next)
})

const port = parseInt(process.env.PORT || "3000")

export default {
  port,
  fetch: app.fetch,
}

// Server running on port ${port}

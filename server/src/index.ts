import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { stream } from 'hono/streaming'
import { serveStatic } from 'hono/bun'
import type { ApiResponse } from 'shared/dist'
import { getSnapchainHttpUrl } from 'shared/dist'
import { SnapchainClient, type SubscribeRequest } from './snapchain'
import { getSSLHubRpcClient, HubEventType } from '@farcaster/hub-nodejs'
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
    const client = getSSLHubRpcClient('snap.farcaster.xyz:3383');
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
  const { searchParams } = new URL(c.req.url);
  const isStream = searchParams.get('stream') === 'true';
  
  // Use polling for non-stream requests
  if (!isStream) {
    const limit = parseInt(c.req.query('limit') || '5');
    const maxWaitTime = parseInt(c.req.query('wait') || '3000');
    
    try {
      const hubRpcEndpoint = "snap.farcaster.xyz:3383";
      const nodeClient = getSSLHubRpcClient(hubRpcEndpoint);
      const events: any[] = [];
      
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => resolve(), maxWaitTime);
      });
      
      const eventPromise = new Promise<void>((resolve) => {
        nodeClient.$.waitForReady(Date.now() + 5000, async (e) => {
          if (e) {
            resolve();
            return;
          }

          try {
            const subscribeResult = await nodeClient.subscribe({
              eventTypes: [HubEventType.MERGE_MESSAGE],
            });

            if (subscribeResult.isOk()) {
              const eventStream = subscribeResult.value;

              for await (const event of eventStream) {
                if (event.mergeMessageBody?.message?.data?.type === 1) {
                  const message = event.mergeMessageBody.message;
                  const messageData = message.data;
                  const castBody = messageData.castAddBody;

                  if (castBody && message.hash) {
                    const hash = Buffer.from(message.hash).toString('hex');
                    const eventData = {
                      type: 'event',
                      data: {
                        type: 'cast',
                        id: hash,
                        username: `fid${messageData.fid}`,
                        content: castBody.text || '',
                        timestamp: new Date(messageData.timestamp * 1000).toISOString(),
                        embeds: castBody.embeds?.length.toString() || '0',
                        link: `https://warpcast.com/~/conversations/${hash}`,
                        time: new Date(messageData.timestamp * 1000).toLocaleString()
                      }
                    };
                    
                    events.push(eventData);
                    
                    if (events.length >= limit) {
                      break;
                    }
                  }
                }
              }
            }
          } catch (error) {
            // Silent fail
          } finally {
            nodeClient.close();
            resolve();
          }
        });
      });
      
      await Promise.race([eventPromise, timeoutPromise]);
      
      return c.json({
        events,
        count: events.length,
        timestamp: new Date().toISOString(),
        source: 'polling'
      });
      
    } catch (error) {
      return c.json({ 
        events: [], 
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'polling_error'
      }, 200);
    }
  }

  const encoder = new TextEncoder();
  
  const customReadable = new ReadableStream({
    start(controller) {
      let isStreamActive = true;
      
      const startStream = async () => {
        try {
          const hubRpcEndpoint = "snap.farcaster.xyz:3383";
          const nodeClient = getSSLHubRpcClient(hubRpcEndpoint);

          const connectionTimeout = setTimeout(() => {
            if (isStreamActive) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                error: 'Connection timeout, switching to polling',
                fallback: true
              })}\n\n`));
              nodeClient.close();
              isStreamActive = false;
            }
          }, 3000);

          nodeClient.$.waitForReady(Date.now() + 3000, async (e) => {
            clearTimeout(connectionTimeout);
            
            if (!isStreamActive) return;
            
            if (e) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                error: 'Failed to connect to gRPC, switching to polling',
                fallback: true
              })}\n\n`));
              return;
            }

            try {
              const subscribeResult = await nodeClient.subscribe({
                eventTypes: [HubEventType.MERGE_MESSAGE],
              });

              if (subscribeResult.isOk()) {
                const eventStream = subscribeResult.value;

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'connected', 
                  message: 'gRPC stream connected'
                })}\n\n`));

                for await (const event of eventStream) {
                  if (!isStreamActive) break;
                  
                  if (event.mergeMessageBody?.message?.data?.type === 1) {
                    const message = event.mergeMessageBody.message;
                    const messageData = message.data;
                    const castBody = messageData.castAddBody;

                    if (castBody && message.hash) {
                      const hash = Buffer.from(message.hash).toString('hex');
                      const eventData = {
                        type: 'cast',
                        id: hash,
                        fid: Number(messageData.fid),
                        username: `fid${messageData.fid}`,
                        content: castBody.text || '',
                        timestamp: new Date(messageData.timestamp * 1000).toISOString(),
                        embeds: castBody.embeds?.length.toString() || '0',
                        link: `https://warpcast.com/~/conversations/${hash}`,
                        time: new Date(messageData.timestamp * 1000).toLocaleString()
                      };

                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
                    }
                  }
                }
              } else {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'error', 
                  error: 'Failed to subscribe, switching to polling',
                  fallback: true
                })}\n\n`));
              }
            } catch (subscribeError) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                error: 'Subscription failed, switching to polling',
                fallback: true
              })}\n\n`));
            } finally {
              nodeClient.close();
            }
          });
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            error: 'Connection failed, switching to polling',
            fallback: true
          })}\n\n`));
        }
      };

      startStream();
    },
    
    cancel() {
      
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
      // Production fixes for Fly.io
      'X-Forwarded-Proto': 'https',
      'Vary': 'Accept-Encoding',
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

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

// Hub API endpoints
app.get('/api/hub/castsByFid', async (c) => {
  try {
    const fid = c.req.query('fid')
    const pageSize = c.req.query('pageSize') || '1000'
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    const response = await fetch(`${nodeUrl}/v1/castsByFid?fid=${fid}&pageSize=${pageSize}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json() as any
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to fetch casts' }, { status: 500 })
  }
})

app.get('/api/hub/reactionsByFid', async (c) => {
  try {
    const fid = c.req.query('fid')
    const pageSize = c.req.query('pageSize') || '1000'
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    const response = await fetch(`${nodeUrl}/v1/reactionsByFid?fid=${fid}&pageSize=${pageSize}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json() as any
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
})

app.get('/api/hub/linksByFid', async (c) => {
  try {
    const fid = c.req.query('fid')
    const pageSize = c.req.query('pageSize') || '1000'
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    const response = await fetch(`${nodeUrl}/v1/linksByFid?fid=${fid}&pageSize=${pageSize}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json() as any
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
})

app.get('/api/hub/verificationsByFid', async (c) => {
  try {
    const fid = c.req.query('fid')
    const pageSize = c.req.query('pageSize') || '1000'
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    const response = await fetch(`${nodeUrl}/v1/verificationsByFid?fid=${fid}&pageSize=${pageSize}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json() as any
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to fetch verifications' }, { status: 500 })
  }
})

app.get('/api/hub/userDataByFid', async (c) => {
  try {
    const fid = c.req.query('fid')
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    const response = await fetch(`${nodeUrl}/v1/userDataByFid?fid=${fid}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json() as any
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
})

app.post('/api/hub/decodeSignerMetadata', async (c) => {
  try {
    const { metadata } = await c.req.json()
    if (!metadata) {
      return c.json({ error: 'Metadata required' }, { status: 400 })
    }
    
    // Simple ABI decoding for SignedKeyRequest
    // This is a simplified version - in production you'd use proper ABI decoding
    const decoded = {
      requestFid: Math.floor(Math.random() * 1000000), // Mock for now
      requestSigner: '0x' + '0'.repeat(40),
      signature: '0x' + '0'.repeat(128),
      deadline: Date.now() + 86400000
    }
    
    return c.json(decoded)
  } catch (error) {
    return c.json({ error: 'Failed to decode metadata' }, { status: 500 })
  }
})

app.get('/api/hub/messagesBySigner', async (c) => {
  try {
    const signer = c.req.query('signer')
    const fid = c.req.query('fid')
    
    if (!signer || !fid) {
      return c.json({ error: 'Signer and FID required' }, { status: 400 })
    }
    
    const nodeUrl = getSnapchainHttpUrl(c.req.header('X-Snapchain-Node'))
    
    // Fetch all message types for this FID and filter by signer
    const endpoints = [
      `${nodeUrl}/v1/castsByFid?fid=${fid}&pageSize=1000`,
      `${nodeUrl}/v1/reactionsByFid?fid=${fid}&pageSize=1000`,
      `${nodeUrl}/v1/linksByFid?fid=${fid}&pageSize=1000`,
      `${nodeUrl}/v1/verificationsByFid?fid=${fid}&pageSize=1000`
    ]
    
    const responses = await Promise.all(
      endpoints.map(url => 
        fetch(url)
          .then(res => res.ok ? res.json() : { messages: [] })
          .catch(() => ({ messages: [] }))
      )
    )
    
    const [castsData, reactionsData, linksData, verificationsData] = responses as any[]
    
    // Filter messages by signer and count
    const filterBySigner = (messages: any[]) => 
      messages.filter((msg: any) => msg.signer === signer || 
        (msg.data && msg.data.signer === signer))
    
    const casts = filterBySigner(castsData?.messages || [])
    const reactions = filterBySigner(reactionsData?.messages || [])
    const links = filterBySigner(linksData?.messages || [])
    const verifications = filterBySigner(verificationsData?.messages || [])
    
    // Find last used timestamp
    const allMessages = [...casts, ...reactions, ...links, ...verifications]
    const lastUsed = allMessages.reduce((latest, msg) => {
      const timestamp = msg.data?.timestamp || msg.timestamp
      if (timestamp && (!latest || timestamp > latest)) {
        return timestamp
      }
      return latest
    }, null)
    
    return c.json({
      casts: casts.length,
      reactions: reactions.length,
      links: links.length,
      verifications: verifications.length,
      lastUsed: lastUsed ? new Date(lastUsed * 1000).toISOString() : null
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages by signer' }, { status: 500 })
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
    const events: any[] = [];
    const eventStream = await snapchain.subscribe({
      eventTypes: [HubEventType.MERGE_MESSAGE],
      shardIndex: 1,
      fromId: 0
    });

    const startTime = Date.now();
    const timeoutMs = 3000;
    let count = 0;
    
    for await (const event of eventStream) {
      events.push(event);
      count++;
      if (count >= limit) break;
      if (Date.now() - startTime > timeoutMs) break;
    }
    
    return c.json({ events, count: events.length });
  } catch (error) {
    return c.json({ error: 'Failed to get recent events', events: [], count: 0 }, 500);
  }
});

// Server-Sent Events stream for real-time events
app.get('/api/events/stream', async (c) => {
  const encoder = new TextEncoder();
  let snapchainClient: SnapchainClient | null = null;
  
  const customReadable = new ReadableStream({
    start(controller) {
      // Send initial connection message immediately
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'connected',
          timestamp: new Date().toISOString()
        })}\n\n`));
      } catch (e) {
        controller.close();
        return;
      }

      const startGrpcStream = async () => {
        const isProduction = process.env.NODE_ENV === 'production';
        let heartbeatInterval: NodeJS.Timeout | null = null;
        
        try {
          snapchainClient = new SnapchainClient();
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'ready',
            timestamp: new Date().toISOString()
          })}\n\n`));

          // More frequent heartbeat for production to prevent timeouts
          const heartbeatFreq = isProduction ? 5000 : 10000;
          heartbeatInterval = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'heartbeat',
                timestamp: new Date().toISOString()
              })}\n\n`));
            } catch {
              if (heartbeatInterval) clearInterval(heartbeatInterval);
              controller.close();
            }
          }, heartbeatFreq);

          const eventStream = await snapchainClient.subscribe({
            eventTypes: [HubEventType.MERGE_MESSAGE],
            shardIndex: 1,
            fromId: 0
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'streaming',
            timestamp: new Date().toISOString()
          })}\n\n`));

          let eventsSent = 0;
          const maxEvents = isProduction ? 500 : 1000; // Increased limit for production
          
          for await (const event of eventStream) {
            try {
              if (eventsSent >= maxEvents) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'info',
                  message: 'Stream limit reached, reconnecting...',
                  timestamp: new Date().toISOString()
                })}\n\n`));
                break;
              }
              
              const eventData = {
                type: event.type,
                id: event.id,
                username: event.username,
                content: event.content,
                timestamp: event.time,
                embeds: event.embeds || '0',
                link: event.link,
                time: new Date(event.time).toLocaleString()
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
              eventsSent++;
            } catch (eventError) {
              // Log error but continue processing
              console.error('Event processing error:', eventError);
              continue;
            }
          }

        } catch (error) {
          console.error('Stream error:', error);
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error',
              error: error instanceof Error ? error.message : 'Stream ended',
              timestamp: new Date().toISOString()
            })}\n\n`));
          } catch (controllerError) {
            console.error('Controller error:', controllerError);
          }
        } finally {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          try {
            controller.close();
          } catch (e) {
            // Controller might already be closed
          }
        }
      };

      // Start the stream with error handling
      startGrpcStream().catch((error) => {
        console.error('Failed to start GRPC stream:', error);
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error',
            error: error instanceof Error ? error.message : 'Connection failed',
            timestamp: new Date().toISOString()
          })}\n\n`));
          controller.close();
        } catch (e) {
          controller.close();
        }
      });
    },
    
    cancel() {
      snapchainClient = null;
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
      // Additional headers for better streaming support
      'Pragma': 'no-cache',
      'Expires': '0',
      // Fly.io specific headers
      'Fly-Force-Instance-Id': 'true',
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

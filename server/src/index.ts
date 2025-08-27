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
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
        type: 'connected',
        timestamp: new Date().toISOString()
      })}\n\n`));

      const startGrpcStream = async () => {
        try {
          snapchainClient = new SnapchainClient();
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'ready',
            timestamp: new Date().toISOString()
          })}\n\n`));

          const eventStream = await snapchainClient.subscribe({
            eventTypes: [HubEventType.MERGE_MESSAGE],
            shardIndex: 1,
            fromId: 0
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'streaming',
            timestamp: new Date().toISOString()
          })}\n\n`));

          for await (const event of eventStream) {
            try {
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
            } catch (eventError) {
              continue;
            }
          }

        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream ended',
            timestamp: new Date().toISOString()
          })}\n\n`));
          controller.close();
        }
      };

      startGrpcStream().catch((error) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error',
          error: error instanceof Error ? error.message : 'Connection failed',
          timestamp: new Date().toISOString()
        })}\n\n`));
        controller.close();
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

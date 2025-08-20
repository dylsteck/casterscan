import { BASE_URL, HUB_GRPC_URL, cachedRequest } from "@/app/lib/utils";
import { getSSLHubRpcClient, HubEventType } from "@farcaster/hub-nodejs";

// Use a Map to store per-request connections instead of global state
const connectionMap = new Map<string, {
  client: any;
  stream: any;
  lastUsed: number;
}>();

// Clean up old connections periodically
const cleanupOldConnections = () => {
  const now = Date.now();
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  for (const [key, connection] of connectionMap.entries()) {
    if (now - connection.lastUsed > CLEANUP_INTERVAL) {
      try {
        connection.client?.close();
      } catch (e) {
        console.error("Error closing old GRPC client", e);
      }
      connectionMap.delete(key);
    }
  }
};

// Create a GRPC connection with timeout and better error handling
const createGrpcConnection = async (connectionId: string): Promise<{client: any, stream: any}> => {
  const client = getSSLHubRpcClient(HUB_GRPC_URL);
  
  try {
    // Set a shorter timeout for production
    const timeout = process.env.NODE_ENV === 'production' ? 3000 : 5000;
    
    await new Promise<void>((resolve, reject) => {
      client.$.waitForReady(Date.now() + timeout, (error) => {
        if (error) {
          reject(new Error(`Failed to connect to ${HUB_GRPC_URL}: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    const subscribeResult = await client.subscribe({
      eventTypes: [HubEventType.MERGE_MESSAGE],
    });

    if (!subscribeResult.isOk()) {
      throw new Error("Failed to subscribe to events.");
    }

    const stream = subscribeResult.value;
    
    // Store the connection
    connectionMap.set(connectionId, {
      client,
      stream,
      lastUsed: Date.now()
    });

    return { client, stream };
  } catch (error) {
    try {
      client?.close();
    } catch (e) {
      console.error("Error closing client after failed setup:", e);
    }
    throw error;
  }
};

export async function GET(request: Request) {
  const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  // Clean up old connections
  cleanupOldConnections();
  
  try {
    const readableStream = new ReadableStream({
      async start(controller) {
        let keepAliveInterval: NodeJS.Timeout | undefined;
        let connection: { client: any; stream: any } | null = null;
        let isStreamActive = true;

        try {
          // Send initial ping
          controller.enqueue(`data: {"ping": true}\n\n`);
          
          // Try to get or create GRPC connection
          let existingConnection = connectionMap.get(connectionId);
          if (!existingConnection) {
            try {
              connection = await createGrpcConnection(connectionId);
              existingConnection = connectionMap.get(connectionId);
            } catch (error) {
              console.error("Failed to create GRPC connection:", error);
              controller.enqueue(`data: {"error": "Failed to connect to Farcaster hub"}\n\n`);
              controller.close();
              return;
            }
          }

          if (existingConnection) {
            existingConnection.lastUsed = Date.now();
            
            // Process stream messages
            (async () => {
              try {
                for await (const event of existingConnection.stream) {
                  if (!isStreamActive) break;
                  
                  // Update last used timestamp
                  existingConnection.lastUsed = Date.now();
                  
                  if (event.mergeMessageBody?.message?.data?.type === 1) {
                    try {
                      const authorFid = event.mergeMessageBody.message.data.fid;
                      if (!authorFid) continue;
                      
                      // Fetch user data with timeout for production
                      const userDataPromise = cachedRequest(
                        `${BASE_URL}/api/warpcast/user?fid=${authorFid}`,
                        60,
                        'GET',
                        undefined,
                        `warpcast:user:${authorFid}`
                      );
                      
                      // Add timeout wrapper for production
                      const userData = await Promise.race([
                        userDataPromise,
                        new Promise((_, reject) => 
                          setTimeout(() => reject(new Error('User fetch timeout')), 5000)
                        )
                      ]).catch(() => ({ result: { user: null } }));
                      
                      const data = {
                        author: userData?.result || { user: null },
                        hash: event.mergeMessageBody.message.hash ? 
                          `0x${event.mergeMessageBody.message.hash.toString('hex')}` : 
                          `unknown-${Date.now()}`,
                        text: event.mergeMessageBody.message.data.castAddBody?.text || "",
                        timestamp: `${event.mergeMessageBody.message.data.timestamp || Date.now()}`,
                        parentUrl: event.mergeMessageBody.message.data.castAddBody?.parentUrl || null,
                        embeds: event.mergeMessageBody.message.data.castAddBody?.embeds || []
                      };
                      
                      if (isStreamActive) {
                        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
                      }
                    } catch (err) {
                      console.error("Error processing message:", err);
                      continue;
                    }
                  }
                }
              } catch (err) {
                if (isStreamActive) {
                  console.error("Error in stream processing:", err);
                  controller.enqueue(`data: {"error": "Stream processing error"}\n\n`);
                }
              }
            })();
          }
          
          // Set up keep-alive pings with shorter interval for production
          const pingInterval = process.env.NODE_ENV === 'production' ? 15000 : 20000;
          keepAliveInterval = setInterval(() => {
            if (isStreamActive) {
              try {
                controller.enqueue(`data: {"ping": true}\n\n`);
              } catch (err) {
                isStreamActive = false;
                if (keepAliveInterval) clearInterval(keepAliveInterval);
              }
            }
          }, pingInterval);
          
        } catch (err) {
          console.error("Stream setup error:", err);
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          controller.enqueue(`data: {"error": "Stream setup failed"}\n\n`);
          controller.close();
        }
      },
      cancel() {
        // Clean up connection when client disconnects
        const connection = connectionMap.get(connectionId);
        if (connection) {
          try {
            connection.client?.close();
          } catch (e) {
            console.error("Error closing GRPC client on cancel:", e);
          }
          connectionMap.delete(connectionId);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Cache-Control"
      },
    });
  } catch (error) {
    console.error("Stream route error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
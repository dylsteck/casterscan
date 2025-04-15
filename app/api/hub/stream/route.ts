import { BASE_URL, HUB_GRPC_URL, cachedRequest } from "@/app/lib/utils";
import { getSSLHubRpcClient, HubEventType } from "@farcaster/hub-nodejs";

// Track active clients to avoid redundant GRPC connections
let activeClients = 0;
let activeClient: any = null;
let activeStream: any = null;
let messageQueue: any[] = [];
let connectedControllers: ReadableStreamDefaultController[] = [];

// Clean up resources when the server restarts
const cleanup = () => {
  if (activeClient) {
    try {
      activeClient.close();
    } catch (e) {
      console.error("Error closing GRPC client", e);
    }
    activeClient = null;
    activeStream = null;
  }
  messageQueue = [];
  connectedControllers = [];
  activeClients = 0;
};

// Handle shutdown gracefully
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Shared GRPC client and subscription
const setupGrpcConnection = async () => {
  if (activeClient) return;
  
  const client = getSSLHubRpcClient(HUB_GRPC_URL);
  activeClient = client;
  
  try {
    await new Promise<void>((resolve, reject) => {
      client.$.waitForReady(Date.now() + 5000, (error) => {
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

    activeStream = subscribeResult.value;

    (async () => {
      try {
        for await (const event of activeStream) {
          if (event.mergeMessageBody?.message?.data?.type === 1) {
            try {
              const authorFid = event.mergeMessageBody.message.data.fid;
              if (!authorFid) continue;
              
              try {
                const userData = await cachedRequest(
                  `${BASE_URL}/api/warpcast/user?fid=${authorFid}`,
                  60,
                  'GET',
                  undefined,
                  `warpcast:user:${authorFid}`
                );
                
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
                
                messageQueue.unshift(data);
                if (messageQueue.length > 100) {
                  messageQueue = messageQueue.slice(0, 100);
                }
                
                const message = `data: ${JSON.stringify(data)}\n\n`;
                connectedControllers.forEach(controller => {
                  try {
                    controller.enqueue(message);
                  } catch (err) {
                    throw err;
                  }
                });
              } catch (err) {
                console.error("Error fetching user data:", err);
                continue;
              }
            } catch (err) {
              console.error("Error processing message:", err);
              continue;
            }
          }
        }
      } catch (err) {
        console.error("Error in stream processing:", err);
        cleanup();
      }
    })();
  } catch (error) {
    console.error("Error setting up GRPC connection:", error);
    if (activeClient === client) {
      cleanup();
    }
    throw error;
  }
};

export async function GET() {
  activeClients++;
  
  try {
    if (!activeClient || !activeStream) {
      await setupGrpcConnection();
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        let keepAliveInterval: number | undefined;

        try {
          connectedControllers.push(controller);
          
          controller.enqueue(`data: {"ping": true}\n\n`);
          
          if (messageQueue.length > 0) {
            messageQueue.forEach(data => {
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            });
          }
          
          // Set up keep-alive pings
          keepAliveInterval = setInterval(() => {
            try {
              controller.enqueue(`data: {"ping": true}\n\n`);
            } catch (err) {
              if (keepAliveInterval) clearInterval(keepAliveInterval);
            }
          }, 20000) as unknown as number;
        } catch (err) {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          const index = connectedControllers.indexOf(controller);
          if (index !== -1) {
            connectedControllers.splice(index, 1);
          }
          controller.close();
        }
      },
      cancel(controller) {
        // Remove controller when client disconnects
        const index = connectedControllers.indexOf(controller);
        if (index !== -1) {
          connectedControllers.splice(index, 1);
        }
        
        activeClients--;
        
        // If no more clients, clean up resources after a delay
        if (activeClients === 0) {
          setTimeout(() => {
            if (activeClients === 0) {
              cleanup();
            }
          }, 60000);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      },
    });
  } catch (error) {
    activeClients--;
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
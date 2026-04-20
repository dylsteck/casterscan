import { createFileRoute } from "@tanstack/react-router";
import { bytesToHexString } from "@farcaster/hub-web";
import { HubEventType, getSSLHubRpcClient } from "@farcaster/hub-nodejs";

// Polyfill: @farcaster/hub-web expects `self` (browser global). In Node, use global.
if (typeof global !== "undefined" && !(global as typeof global & { self?: typeof global }).self) {
  (global as typeof global & { self?: typeof global }).self = global;
}

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: async () => {
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          start(controller) {
            let isClosed = false;
            let nodeClient: ReturnType<typeof getSSLHubRpcClient> | null = null;

            const safeEnqueue = (data: Uint8Array) => {
              try {
                if (!isClosed) {
                  controller.enqueue(data);
                }
              } catch {
                isClosed = true;
              }
            };

            const closeClient = () => {
              if (nodeClient) {
                try {
                  nodeClient.close();
                } catch {
                  // noop
                }
              }
            };

            const startStream = async () => {
              try {
                const hubRpcEndpoint = "snap.farcaster.xyz:3383";
                nodeClient = getSSLHubRpcClient(hubRpcEndpoint);

                nodeClient.$.waitForReady(Date.now() + 5000, async (error) => {
                  if (error) {
                    safeEnqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to connect" })}\n\n`));
                    return;
                  }

                  try {
                    const subscribeResult = await nodeClient!.subscribe({
                      eventTypes: [HubEventType.MERGE_MESSAGE],
                    });

                    if (subscribeResult.isOk()) {
                      const hubStream = subscribeResult.value;
                      for await (const event of hubStream) {
                        if (isClosed) {
                          break;
                        }

                        if (event.mergeMessageBody?.message?.data?.type === 1) {
                          const message = event.mergeMessageBody.message;
                          const hash = message.hash;
                          const text = message.data.castAddBody?.text;
                          const fid = message.data.fid;

                          if (hash && text && !isClosed) {
                            const hexHash = bytesToHexString(hash)._unsafeUnwrap();
                            safeEnqueue(
                              encoder.encode(
                                `data: ${JSON.stringify({
                                  hash: hexHash,
                                  fid: Number(fid),
                                  text,
                                })}\n\n`
                              )
                            );
                          }
                        }
                      }
                    } else {
                      safeEnqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to subscribe" })}\n\n`));
                    }
                  } catch {
                    safeEnqueue(encoder.encode(`data: ${JSON.stringify({ error: "Subscription failed" })}\n\n`));
                  } finally {
                    closeClient();
                  }
                });
              } catch {
                safeEnqueue(encoder.encode(`data: ${JSON.stringify({ error: "Connection failed" })}\n\n`));
              }
            };

            void startStream();

            return () => {
              isClosed = true;
              closeClient();
            };
          },
          cancel() {
            // client disconnected
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Cache-Control",
          },
        });
      },
    },
  },
});

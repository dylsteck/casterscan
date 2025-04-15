import { BASE_URL, NEYNAR_HUB_GRPC_URL } from "@/app/lib/utils";
import { createDefaultMetadataKeyInterceptor, getSSLHubRpcClient, HubEventType } from "@farcaster/hub-nodejs";

export async function GET() {
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY ?? "";
  const client = getSSLHubRpcClient(NEYNAR_HUB_GRPC_URL, {
    interceptors: [
        createDefaultMetadataKeyInterceptor('x-api-key', NEYNAR_API_KEY),
    ],
    'grpc.max_receive_message_length': 20 * 1024 * 1024, 
});

  try {
    await new Promise<void>((resolve, reject) => {
      client.$.waitForReady(Date.now() + 5000, (error) => {
        if (error) {
          reject(new Error(`Failed to connect to ${NEYNAR_HUB_GRPC_URL}: ${error.message}`));
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
    let isClosed = false;

    const readableStream = new ReadableStream({
      async start(controller) {
        let keepAliveInterval: number | undefined;

        try {
          controller.enqueue(`data: {"ping": true}\n\n`);
          
          keepAliveInterval = setInterval(() => {
            if (!isClosed) {
              controller.enqueue(`data: {"ping": true}\n\n`);
            }
          }, 20000) as unknown as number;

          for await (const event of stream) {
            if (isClosed) break;
            if (event.mergeMessageBody.message.data.type === 1) {
              const authorFid = event.mergeMessageBody.message.data.fid;
              const userResponse = await fetch(
                `${BASE_URL}/api/warpcast/user?fid=${authorFid}`
              );
              
              if (!userResponse.ok) {
                continue;
              }
              
              const userData = await userResponse.json();
              const data = {
                author: userData.result,
                hash: `0x${event.mergeMessageBody.message.hash.toString('hex')}`,
                text: event.mergeMessageBody.message.data.castAddBody.text,
                timestamp: `${event.mergeMessageBody.message.data.timestamp}`,
                parentUrl: event.mergeMessageBody.message.data.castAddBody.parentUrl,
                embeds: event.mergeMessageBody.message.data.castAddBody.embeds
              };
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }
          }
        } catch (err) {
          if (!isClosed) {
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            client.close();
            controller.close();
          }
        } finally {
          if (!isClosed) {
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            controller.close();
          }
        }
      },
      cancel() {
        isClosed = true;
        client.close();
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
    client.close();
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
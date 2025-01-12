import { BASE_URL, PINATA_HUB_GRPC_URL } from "@/app/lib/utils";
import { getSSLHubRpcClient, HubEventType } from "@farcaster/hub-nodejs";

export async function GET() {
  const hubRpcEndpoint = PINATA_HUB_GRPC_URL
  const client = getSSLHubRpcClient(hubRpcEndpoint);

  try {
    await new Promise<void>((resolve, reject) => {
      client.$.waitForReady(Date.now() + 5000, (error) => {
        if (error) {
          reject(new Error(`Failed to connect to ${hubRpcEndpoint}: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    console.log(`Connected to ${hubRpcEndpoint}`);

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
        try {
          for await (const event of stream) {
            if (isClosed) break;
            if (event.mergeMessageBody.message.data.type === 1) {
              const authorFid = event.mergeMessageBody.message.data.fid;
              const userResponse = await fetch(
                `${BASE_URL}/api/warpcast/user?fid=${authorFid}`
              );
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
            console.error("Error during streaming:", err);
            controller.error(err);
          }
        } finally {
          if (!isClosed) {
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
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error(error);
    client.close();
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
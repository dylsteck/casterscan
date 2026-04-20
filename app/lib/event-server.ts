import { createServerFn } from "@tanstack/react-start";

const getEventServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { eventId: string; shardIndex: string }) => data)
  .handler(async ({ data }) => {
    const { ensureInitialized } = await import("@/app/server/bootstrap.js");
    const { getEvent } = await import("@/app/server/services/snapchain.js");
    await ensureInitialized();
    return getEvent(data.eventId, data.shardIndex);
  });

export async function getEventById(eventId: string, shardIndex: string) {
  return getEventServerFn({ data: { eventId, shardIndex } });
}

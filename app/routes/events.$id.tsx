import EventDetails from "@/app/components/custom/event-details";
import { getEventById } from "@/app/lib/event-server";
import { BASE_URL, SEO, frame } from "@/app/lib/utils";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/events/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    shard_index: typeof search.shard_index === "string" ? search.shard_index : "1",
  }),
  loader: async ({ params, search }) => {
    const eventData = await getEventById(params.id, search.shard_index || "1");
    if (!eventData) {
      throw notFound();
    }
    return { eventData, shardIndex: search.shard_index || "1" };
  },
  head: ({ params }) => ({
    meta: [
      { title: SEO.title },
      { name: "description", content: SEO.description },
      { property: "og:title", content: SEO.title },
      { property: "og:description", content: SEO.description },
      { property: "og:image", content: SEO.ogImage },
      { property: "og:url", content: SEO.url },
      { name: "fc:frame", content: JSON.stringify(frame("Inspect Event", `${BASE_URL}/events/${params.id}`)) },
    ],
  }),
  component: EventRouteComponent,
});

function EventRouteComponent() {
  const { id } = Route.useParams();
  const { eventData, shardIndex } = Route.useLoaderData();
  return <EventDetails eventId={id} shardIndex={shardIndex} eventData={eventData as any} />;
}

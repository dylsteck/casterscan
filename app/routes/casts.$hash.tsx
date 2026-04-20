import CastDetails from "@/app/components/custom/cast-details";
import { getNeynarCast } from "@/app/lib/server";
import { BASE_URL, SEO, frame } from "@/app/lib/utils";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/casts/$hash")({
  loader: async ({ params }) => {
    const neynarCast = await getNeynarCast(params.hash, "hash");
    if (!neynarCast) {
      throw notFound();
    }
    return { neynarCast };
  },
  head: ({ params }) => ({
    meta: [
      { title: `${SEO.title}` },
      { name: "description", content: SEO.description },
      { property: "og:title", content: SEO.title },
      { property: "og:description", content: SEO.description },
      { property: "og:image", content: SEO.ogImage },
      { property: "og:url", content: SEO.url },
      { name: "fc:frame", content: JSON.stringify(frame("Inspect Cast", `${BASE_URL}/casts/${params.hash}`)) },
    ],
  }),
  component: CastRouteComponent,
});

function CastRouteComponent() {
  const { hash } = Route.useParams();
  const { neynarCast } = Route.useLoaderData();

  return <CastDetails hash={hash} neynarCast={neynarCast} />;
}

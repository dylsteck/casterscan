import CastDetails from "@/app/components/custom/cast-details";
import { getHypersnapCast } from "@/app/lib/server";
import { BASE_URL, SEO, frame } from "@/app/lib/utils";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/casts/$hash")({
  loader: async ({ params }) => {
    const hypersnapCast = await getHypersnapCast(params.hash, "hash");
    if (!hypersnapCast) {
      throw notFound();
    }
    return { hypersnapCast };
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
  const { hypersnapCast } = Route.useLoaderData();

  return <CastDetails hash={hash} hypersnapCast={hypersnapCast} />;
}

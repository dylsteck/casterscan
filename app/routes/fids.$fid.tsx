import ProfileDetails from "@/app/components/custom/profile-details";
import { getFarcasterKeys, getNeynarUser } from "@/app/lib/server";
import { BASE_URL, SEO, frame } from "@/app/lib/utils";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/fids/$fid")({
  loader: async ({ params }) => {
    const [neynarUser, keysData] = await Promise.all([getNeynarUser(params.fid), getFarcasterKeys(params.fid)]);
    if (!neynarUser || !keysData) {
      throw notFound();
    }
    return { neynarUser, keysData };
  },
  head: ({ params }) => ({
    meta: [
      { title: SEO.title },
      { name: "description", content: SEO.description },
      { property: "og:title", content: SEO.title },
      { property: "og:description", content: SEO.description },
      { property: "og:image", content: SEO.ogImage },
      { property: "og:url", content: SEO.url },
      { name: "fc:frame", content: JSON.stringify(frame("Inspect Profile", `${BASE_URL}/fids/${params.fid}`)) },
    ],
  }),
  component: FidRouteComponent,
});

function FidRouteComponent() {
  const { fid } = Route.useParams();
  const { neynarUser, keysData } = Route.useLoaderData();
  return <ProfileDetails fid={fid} neynarUser={neynarUser} keysData={keysData} />;
}

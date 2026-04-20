import ProfileDetails from "@/app/components/custom/profile-details";
import { getFarcasterKeys, getNeynarUserByUsername } from "@/app/lib/server";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/usernames/$username")({
  loader: async ({ params }) => {
    const user = await getNeynarUserByUsername(params.username);
    if (!user?.fid) {
      throw notFound();
    }

    const keysData = await getFarcasterKeys(user.fid.toString());
    if (!keysData) {
      throw notFound();
    }

    return { user, keysData };
  },
  component: UsernameRouteComponent,
});

function UsernameRouteComponent() {
  const { user, keysData } = Route.useLoaderData();
  return <ProfileDetails fid={user.fid.toString()} neynarUser={user} keysData={keysData} />;
}

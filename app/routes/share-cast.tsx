import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMiniAppContext } from "@/app/components/custom/mini-app-provider";

export const Route = createFileRoute("/share-cast")({
  component: ShareCastPage,
});

function ShareCastPage() {
  const { context, ready, isInMiniApp } = useMiniAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isInMiniApp) {
      navigate({ to: "/", replace: true });
      return;
    }

    if (context?.location?.type === "cast_share" && context.location.cast?.hash) {
      navigate({ to: `/casts/${context.location.cast.hash}`, replace: true });
    }
  }, [context?.location, isInMiniApp, navigate, ready]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="space-y-4 border border-black p-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

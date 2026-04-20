import { createFileRoute } from "@tanstack/react-router";
import { LiveFeed } from "@/app/components/custom/live-feed/live-feed";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <LiveFeed />
    </main>
  );
}

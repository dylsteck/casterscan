import { createFileRoute } from "@tanstack/react-router";
import { LiveFeed } from "@/components/LiveFeed";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return <LiveFeed />;
}

export default Index;

import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/not-found")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="max-w-md text-gray-600">The page you are looking for does not exist or has been moved.</p>
      </div>

      <Link
        to="/"
        className="border border-black bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-black hover:text-white"
      >
        Go Home
      </Link>
    </div>
  );
}

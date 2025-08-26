import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient } from '@tanstack/react-query';
import { SnapchainProvider } from '@/contexts/SnapchainContext';
import { Layout } from '../components/Layout';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRoute({
	context: (): RouterContext => ({
		queryClient: undefined!, // This will be set by the router
	}),
	component: () => (
		<SnapchainProvider>
			<Layout>
				<Outlet />
			</Layout>
			<TanStackRouterDevtools />
		</SnapchainProvider>
	),
});

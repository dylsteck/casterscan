import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient } from '@tanstack/react-query';
import { SnapchainProvider } from '@/contexts/SnapchainContext';
import { Layout } from '../components/Layout';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRoute({
	context: (): RouterContext => ({
		queryClient: undefined!,
	}),
	component: () => (
		<SnapchainProvider>
			<Layout>
				<Outlet />
			</Layout>
		</SnapchainProvider>
	),
});

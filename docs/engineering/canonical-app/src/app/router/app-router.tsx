import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import type { ReactNode } from "react";

import { routeTree } from "@/routeTree.gen";
import { ArticlesService, createServerApi, type ServerApi } from "@/shared/api";

export type AppApi = ServerApi;

export function getRouter() {
  const api: AppApi = import.meta.env.SSR ? createServerApi() : { ArticlesService };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
      mutations: { retry: 0 },
    },
  });

  function AppProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
      </QueryClientProvider>
    );
  }

  const router = createRouter({
    routeTree,
    Wrap: AppProviders,
    context: { api, queryClient },
    defaultPreload: "intent",
  });
  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}

export type AppRouter = ReturnType<typeof getRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}

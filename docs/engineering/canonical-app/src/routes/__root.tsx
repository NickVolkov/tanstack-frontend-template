import "@fontsource-variable/newsreader/index.css";
import "@fontsource-variable/source-sans-3/index.css";
import "@mantine/core/styles.css";
import "@/styles/app.css";

import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import type { AppApi } from "@/router";

export const Route = createRootRouteWithContext<{
  api: AppApi;
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Canonical Article app" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

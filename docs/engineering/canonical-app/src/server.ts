import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

if (import.meta.env.DEV && process.env.ENABLE_MSW !== "false") {
  const { server } = await import("@/mocks/server");
  server.listen({ onUnhandledRequest: "bypass" });
}

const handler = createStartHandler(defaultStreamHandler);
export default createServerEntry({ fetch: handler });

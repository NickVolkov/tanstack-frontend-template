import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tanstackStart({ server: { entry: "./src/server.ts" } }), nitro()],
  resolve: { tsconfigPaths: true },
  server: {
    port: 3000,
    watch: { ignored: ["**/routeTree.gen.ts"] },
  },
});

import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi/openapi.yaml",
  output: "src/api/generated",
  plugins: [
    "@hey-api/client-fetch",
    {
      name: "@hey-api/sdk",
      operations: {
        strategy: "single",
        containerName: "ApiService",
        nesting(operation) {
          return [
            `${operation.tags?.[0] ?? "Default"}Service`,
            operation.operationId ?? operation.method,
          ];
        },
      },
    },
  ],
});

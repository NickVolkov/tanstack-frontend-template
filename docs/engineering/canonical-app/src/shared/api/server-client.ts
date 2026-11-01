import { createClient, createConfig } from "./generated/client";
import { ApiService, type ArticlesService as ArticlesServiceClass } from "./generated/sdk.gen";

export type ServerApi = { ArticlesService: ArticlesServiceClass };

export function createServerApi(): ServerApi {
  const client = createClient(
    createConfig({
      baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3001",
      credentials: "include",
    }),
  );
  const api = new ApiService({ client });

  return { ArticlesService: api.articlesService };
}

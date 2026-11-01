import { client } from "./generated/client.gen";
import { ApiService, ArticlesService as ArticlesServiceClass } from "./generated/sdk.gen";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL || "",
  credentials: "include",
});

const api = new ApiService({ client });

export const ArticlesService: ArticlesServiceClass = api.articlesService;

import { client } from "@/api/generated/client.gen";
import { ApiService, ArticlesService as ArticlesServiceClass } from "@/api/generated/sdk.gen";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL || "",
  credentials: "include",
});

const api = new ApiService({ client });

export const ArticlesService: ArticlesServiceClass = api.articlesService;

import { fromOpenApi } from "@msw/source/open-api";
import { delay, http, HttpResponse } from "msw";
import type { OpenAPI } from "openapi-types";

import type { CreateArticleDto, UpdateArticleDto } from "@/api/generated/types.gen";

import openApiSpec from "@/mocks/openapi.spec.json";
import {
  createMockArticle,
  deleteMockArticle,
  getMockArticle,
  listMockArticles,
  updateMockArticle,
} from "@/mocks/articles";

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- generated JSON is produced from the same checked OpenAPI document.
const generatedHandlers = await fromOpenApi(openApiSpec as OpenAPI.Document);
const scenario = String(import.meta.env.VITE_ARTICLE_SCENARIO ?? "success");

export const handlers = [
  http.get("*/api/articles", async ({ request }) => {
    await delay(120);
    if (scenario === "error") {
      return HttpResponse.json({ message: "Forced list error" }, { status: 500 });
    }
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 10));
    if (scenario === "empty") {
      return HttpResponse.json({
        items: [],
        meta: { page, limit, total: 0, hasNext: false },
      });
    }
    const status = url.searchParams.get("status");
    return HttpResponse.json(
      listMockArticles({
        page,
        limit,
        status: status === "draft" || status === "published" ? status : undefined,
        search: url.searchParams.get("search") ?? undefined,
      }),
    );
  }),
  http.get("*/api/articles/:articleId", async ({ params }) => {
    await delay(220);
    const article = getMockArticle(String(params.articleId));
    return article
      ? HttpResponse.json(article)
      : HttpResponse.json({ message: "Article not found" }, { status: 404 });
  }),
  http.post("*/api/articles", async ({ request }) => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- MSW emulates the generated endpoint contract.
    const input = (await request.json()) as CreateArticleDto;
    return HttpResponse.json(createMockArticle(input), { status: 201 });
  }),
  http.patch("*/api/articles/:articleId", async ({ params, request }) => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- MSW emulates the generated endpoint contract.
    const input = (await request.json()) as UpdateArticleDto;
    const article = updateMockArticle(String(params.articleId), input);
    return article
      ? HttpResponse.json(article)
      : HttpResponse.json({ message: "Article not found" }, { status: 404 });
  }),
  http.delete("*/api/articles/:articleId", ({ params }) =>
    deleteMockArticle(String(params.articleId))
      ? new HttpResponse(null, { status: 204 })
      : HttpResponse.json({ message: "Article not found" }, { status: 404 }),
  ),
  ...generatedHandlers,
];

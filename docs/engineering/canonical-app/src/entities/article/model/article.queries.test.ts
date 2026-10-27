import { QueryClient, QueryObserver, type InfiniteData } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import type {
  ArticleDto,
  ArticleListItemDto,
  ArticleListResponseDto,
} from "@/api/generated/types.gen";

import {
  articleKeys,
  articleQueries,
  findArticlePreview,
  seedArticleDetail,
  type ArticleServiceClient,
} from "./article.queries";

const preview: ArticleListItemDto = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Preview",
  excerpt: "A partial list projection",
  status: "published",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const detail: ArticleDto = {
  ...preview,
  body: "The complete body exists only in the detail projection.",
  authorName: "Ada Reed",
  createdAt: "2025-12-31T00:00:00.000Z",
};

function infiniteData(item: ArticleListItemDto): InfiniteData<ArticleListResponseDto, number> {
  return {
    pages: [
      {
        items: [item],
        meta: { page: 1, limit: 10, total: 1, hasNext: false },
      },
    ],
    pageParams: [1],
  };
}

function service(): ArticleServiceClient {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the test double implements the deliberately narrow service port.
  return {
    listArticles: vi.fn(),
    getArticle: vi.fn(async () => ({ data: detail, error: undefined })),
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
    deleteArticle: vi.fn(),
  } as unknown as ArticleServiceClient;
}

describe("Article query cache contract", () => {
  it("includes every list parameter in the projection key", () => {
    expect(articleKeys.infiniteList({ status: "draft", limit: 5 })).toEqual([
      "articles",
      "list",
      "infinite",
      { status: "draft", limit: 5 },
    ]);
  });

  it("finds previews across filtered infinite pages", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      articleKeys.infiniteList({ status: "published", limit: 10 }),
      infiniteData(preview),
    );

    expect(findArticlePreview(queryClient, preview.id)).toEqual(preview);
  });

  it("exposes a preview without storing it as successful detail data", () => {
    const queryClient = new QueryClient();
    const options = articleQueries.detail(service(), preview.id, preview);
    const defaultedOptions = queryClient.defaultQueryOptions(options);
    const observer = new QueryObserver(queryClient, defaultedOptions);

    expect(observer.getOptimisticResult(defaultedOptions).data).toEqual(preview);
    expect(queryClient.getQueryData(articleKeys.detail(preview.id))).toBeUndefined();
  });

  it("prefers an already cached complete detail over the placeholder", () => {
    const queryClient = new QueryClient();
    seedArticleDetail(queryClient, detail);
    const options = articleQueries.detail(service(), preview.id, preview);
    const defaultedOptions = queryClient.defaultQueryOptions(options);
    const observer = new QueryObserver(queryClient, defaultedOptions);

    expect(observer.getOptimisticResult(defaultedOptions).data).toEqual(detail);
  });

  it("seeds only the complete detail shape through its typed helper", () => {
    const queryClient = new QueryClient();
    seedArticleDetail(queryClient, detail);

    expect(queryClient.getQueryData(articleKeys.detail(detail.id))).toEqual(detail);
    const compileTimeOnly = () => {
      // @ts-expect-error A list summary is deliberately rejected at compile time.
      seedArticleDetail(queryClient, preview);
    };
    expect(compileTimeOnly).toBeTypeOf("function");
  });
});

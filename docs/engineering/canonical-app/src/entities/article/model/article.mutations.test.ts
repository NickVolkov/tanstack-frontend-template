import { MutationObserver, QueryClient, type InfiniteData } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import type { ArticleDto, ArticleListResponseDto, CreateArticleDto } from "@/shared/api";

import { articleMutations } from "./article.mutations";
import { articleKeys, type ArticleServiceClient } from "./article.queries";

const input: CreateArticleDto = {
  title: "Authoritative mutation response",
  body: "A successful create returns the complete detail representation.",
  status: "draft",
};
const detail: ArticleDto = {
  ...input,
  id: "44444444-4444-4444-8444-444444444444",
  excerpt: "A successful create returns the complete detail representation.",
  authorName: "Ada",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function service(): ArticleServiceClient {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the test double implements the deliberately narrow service port.
  return {
    createArticle: vi.fn(async () => ({ data: detail, error: undefined })),
  } as unknown as ArticleServiceClient;
}

describe("Article mutation cache contract", () => {
  it("seeds complete detail and invalidates every list projection", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const listKey = articleKeys.infiniteList({ status: "draft", limit: 10 });
    queryClient.setQueryData<InfiniteData<ArticleListResponseDto, number>>(listKey, {
      pages: [
        {
          items: [],
          meta: { page: 1, limit: 10, total: 0, hasNext: false },
        },
      ],
      pageParams: [1],
    });

    const observer = new MutationObserver(
      queryClient,
      articleMutations.create(service(), queryClient),
    );
    await observer.mutate(input);

    expect(queryClient.getQueryData(articleKeys.detail(detail.id))).toEqual(detail);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });
});

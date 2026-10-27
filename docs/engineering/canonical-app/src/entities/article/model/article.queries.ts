import {
  infiniteQueryOptions,
  queryOptions,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

import type { ArticlesService as ArticlesServiceType } from "@/api/generated/sdk.gen";
import type {
  ArticleDto,
  ArticleListItemDto,
  ArticleListResponseDto,
  GetApiArticlesData,
} from "@/api/generated/types.gen";

export type ArticleListParams = Omit<NonNullable<GetApiArticlesData["query"]>, "page">;

export type ArticleServiceClient = Pick<
  ArticlesServiceType,
  "listArticles" | "getArticle" | "createArticle" | "updateArticle" | "deleteArticle"
>;

export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  infiniteList: (params: ArticleListParams) =>
    [...articleKeys.lists(), "infinite", params] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (articleId: string) => [...articleKeys.details(), articleId] as const,
};

export function findArticlePreview(
  queryClient: QueryClient,
  articleId: string,
): ArticleListItemDto | undefined {
  const listQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: articleKeys.lists() })
    .filter((query) => query.queryKey[2] === "infinite")
    .sort((left, right) => right.state.dataUpdatedAt - left.state.dataUpdatedAt);

  for (const query of listQueries) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the key family above is the runtime discriminator for this cache shape.
    const data = query.state.data as InfiniteData<ArticleListResponseDto, number> | undefined;

    for (const page of data?.pages ?? []) {
      const preview = page.items.find((item) => item.id === articleId);
      if (preview) return preview;
    }
  }

  return undefined;
}

export function isArticleDetail(
  article: ArticleListItemDto | ArticleDto | undefined,
): article is ArticleDto {
  return article !== undefined && "body" in article;
}

export function seedArticleDetail(queryClient: QueryClient, article: ArticleDto): void {
  queryClient.setQueryData<ArticleDto>(articleKeys.detail(article.id), article);
}

export const articleQueries = {
  infiniteList: (service: ArticleServiceClient, params: ArticleListParams = {}) => {
    const effectiveParams = { ...params, limit: params.limit ?? 10 };

    return infiniteQueryOptions({
      queryKey: articleKeys.infiniteList(effectiveParams),
      initialPageParam: 1,
      staleTime: 30_000,
      queryFn: async ({ pageParam }) => {
        const { data, error } = await service.listArticles({
          query: { ...effectiveParams, page: pageParam },
        });
        if (error || !data) throw error ?? new Error("Article list returned no data");
        return data;
      },
      getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    });
  },
  detail: (
    service: ArticleServiceClient,
    articleId: string,
    placeholderData?: ArticleListItemDto,
  ) =>
    queryOptions({
      queryKey: articleKeys.detail(articleId),
      queryFn: async (): Promise<ArticleListItemDto | ArticleDto> => {
        const { data, error } = await service.getArticle({
          path: { articleId },
        });
        if (error || !data) throw error ?? new Error("Article detail returned no data");
        return data;
      },
      placeholderData,
    }),
};

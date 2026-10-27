import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import type { ArticleDto, ArticleListItemDto } from "@/api/generated/types.gen";
import { articleQueries, findArticlePreview, isArticleDetail } from "@/entities/article";

export type ArticleDetailsState =
  | { status: "loading"; preview?: ArticleListItemDto }
  | { status: "ready"; details: ArticleDto }
  | {
      status: "error";
      preview?: ArticleListItemDto;
      details?: ArticleDto;
    };

export function getArticleDetailsState({
  value,
  cachedPreview,
  isError,
}: {
  value?: ArticleListItemDto | ArticleDto;
  cachedPreview?: ArticleListItemDto;
  isError: boolean;
}): ArticleDetailsState {
  const details = isArticleDetail(value) ? value : undefined;
  const preview = details ? cachedPreview : (value ?? cachedPreview);

  if (isError) return { status: "error", preview, details };
  if (details) return { status: "ready", details };
  return { status: "loading", preview };
}

export function useArticleDetails(articleId: string) {
  const queryClient = useQueryClient();
  const { ArticlesService } = useRouter().options.context.api;
  const cachedPreview = findArticlePreview(queryClient, articleId);
  const query = useQuery(articleQueries.detail(ArticlesService, articleId, cachedPreview));
  const data = getArticleDetailsState({
    value: query.data,
    cachedPreview,
    isError: query.isError,
  });

  return { data, error: query.error, refetch: query.refetch };
}

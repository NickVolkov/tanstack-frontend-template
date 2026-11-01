import { mutationOptions, type QueryClient } from "@tanstack/react-query";

import type { CreateArticleDto, UpdateArticleDto } from "@/shared/api";

import { articleKeys, seedArticleDetail, type ArticleServiceClient } from "./article.queries";

async function refreshArticleLists(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
}

export const articleMutations = {
  create: (service: ArticleServiceClient, queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (body: CreateArticleDto) => {
        const { data, error } = await service.createArticle({ body });
        if (error || !data) throw error ?? new Error("Create Article returned no data");
        return data;
      },
      onSuccess: async (article) => {
        seedArticleDetail(queryClient, article);
        await refreshArticleLists(queryClient);
      },
    }),
  update: (service: ArticleServiceClient, queryClient: QueryClient, articleId: string) =>
    mutationOptions({
      mutationFn: async (body: UpdateArticleDto) => {
        const { data, error } = await service.updateArticle({
          path: { articleId },
          body,
        });
        if (error || !data) throw error ?? new Error("Update Article returned no data");
        return data;
      },
      onSuccess: async (article) => {
        seedArticleDetail(queryClient, article);
        await refreshArticleLists(queryClient);
      },
    }),
  remove: (service: ArticleServiceClient, queryClient: QueryClient, articleId: string) =>
    mutationOptions({
      mutationFn: async () => {
        const { error } = await service.deleteArticle({ path: { articleId } });
        if (error) throw error;
      },
      onSuccess: async () => {
        queryClient.removeQueries({ queryKey: articleKeys.detail(articleId), exact: true });
        await refreshArticleLists(queryClient);
      },
    }),
};

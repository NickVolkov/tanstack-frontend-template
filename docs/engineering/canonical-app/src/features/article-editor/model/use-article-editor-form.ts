import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { articleMutations } from "@/entities/article";
import { useAppForm } from "@/shared/form";

import { articleEditorFormOptions, mapArticleEditorFormToCreateDto } from "./article-editor.form";

export function useArticleEditorForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const { ArticlesService } = useRouter().options.context.api;
  const createArticle = useMutation(articleMutations.create(ArticlesService, queryClient));
  const form = useAppForm({
    ...articleEditorFormOptions,
    onSubmit: async ({ value }) => {
      await createArticle.mutateAsync(mapArticleEditorFormToCreateDto(value));
      onCreated();
    },
  });

  return { form, mutationError: createArticle.error };
}

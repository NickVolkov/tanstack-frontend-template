import { z } from "zod";

import type { CreateArticleDto } from "@/api/generated/types.gen";

export const articleContentSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(20),
});

export const articlePublicationSchema = z.object({
  status: z.enum(["draft", "published"]),
});

export const articleFormSchema = z.object({
  currentStep: z.union([z.literal(1), z.literal(2)]),
  content: articleContentSchema,
  publication: articlePublicationSchema,
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
export type ArticleEditorStep = ArticleFormValues["currentStep"];

export function mapArticleFormToCreateDto(values: ArticleFormValues): CreateArticleDto {
  return {
    title: values.content.title,
    body: values.content.body,
    status: values.publication.status,
  };
}

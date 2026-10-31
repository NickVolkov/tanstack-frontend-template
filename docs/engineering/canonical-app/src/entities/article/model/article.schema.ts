import { z } from "zod";

import type { CreateArticleDto } from "@/api/generated/types.gen";

export const articleFormSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(20),
  publication: z.object({
    status: z.enum(["draft", "published"]),
  }),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export function mapArticleFormToCreateDto(values: ArticleFormValues): CreateArticleDto {
  return {
    title: values.title,
    body: values.body,
    status: values.publication.status,
  };
}

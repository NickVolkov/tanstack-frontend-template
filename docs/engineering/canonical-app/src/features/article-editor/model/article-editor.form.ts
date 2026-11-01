import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

import type { CreateArticleDto } from "@/entities/article";

export const articleEditorContentSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(20),
});

export const articleEditorPublicationSchema = z.object({
  status: z.enum(["draft", "published"]),
});

export const articleEditorFormSchema = z.object({
  currentStep: z.union([z.literal(1), z.literal(2)]),
  content: articleEditorContentSchema,
  publication: articleEditorPublicationSchema,
});

export type ArticleEditorFormValues = z.infer<typeof articleEditorFormSchema>;

const articleEditorInitialValues: ArticleEditorFormValues = {
  currentStep: 1,
  content: { title: "", body: "" },
  publication: { status: "draft" },
};

export const articleEditorFormOptions = formOptions({
  defaultValues: articleEditorInitialValues,
  validators: { onSubmit: articleEditorFormSchema },
});

export function mapArticleEditorFormToCreateDto(values: ArticleEditorFormValues): CreateArticleDto {
  return {
    title: values.content.title,
    body: values.content.body,
    status: values.publication.status,
  };
}

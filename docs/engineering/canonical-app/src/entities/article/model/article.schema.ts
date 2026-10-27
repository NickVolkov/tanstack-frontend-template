import { z } from "zod";

export const articleFormSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(20),
  status: z.enum(["draft", "published"]),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

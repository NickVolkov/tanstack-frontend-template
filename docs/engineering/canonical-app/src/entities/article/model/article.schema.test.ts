import { describe, expect, it } from "vitest";

import {
  articleContentSchema,
  articleFormSchema,
  articlePublicationSchema,
  mapArticleFormToCreateDto,
} from "./article.schema";

describe("Article form schema", () => {
  it("validates the step groups and maps workflow state to the API command", () => {
    expect(articleContentSchema.safeParse({ title: "No", body: "Too short" }).success).toBe(false);
    expect(articlePublicationSchema.parse({ status: "published" })).toEqual({
      status: "published",
    });

    const values = articleFormSchema.parse({
      currentStep: 2,
      content: {
        title: "Grouped form values",
        body: "Each step validates its own group before the workflow advances.",
      },
      publication: { status: "published" },
    });

    expect(mapArticleFormToCreateDto(values)).toEqual({
      title: "Grouped form values",
      body: "Each step validates its own group before the workflow advances.",
      status: "published",
    });
  });
});

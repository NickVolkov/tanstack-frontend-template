import { describe, expect, it } from "vitest";

import {
  articleEditorContentSchema,
  articleEditorFormSchema,
  articleEditorPublicationSchema,
  mapArticleEditorFormToCreateDto,
} from "./article-editor.form";

describe("Article form schema", () => {
  it("validates the step groups and maps workflow state to the API command", () => {
    expect(articleEditorContentSchema.safeParse({ title: "No", body: "Too short" }).success).toBe(
      false,
    );
    expect(articleEditorPublicationSchema.parse({ status: "published" })).toEqual({
      status: "published",
    });

    const values = articleEditorFormSchema.parse({
      currentStep: 2,
      content: {
        title: "Grouped form values",
        body: "Each step validates its own group before the workflow advances.",
      },
      publication: { status: "published" },
    });

    expect(mapArticleEditorFormToCreateDto(values)).toEqual({
      title: "Grouped form values",
      body: "Each step validates its own group before the workflow advances.",
      status: "published",
    });
  });
});

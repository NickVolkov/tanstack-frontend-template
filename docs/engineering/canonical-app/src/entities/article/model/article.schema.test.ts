import { describe, expect, it } from "vitest";

import { articleFormSchema, mapArticleFormToCreateDto } from "./article.schema";

describe("Article form schema", () => {
  it("validates nested publication state and maps it to the API command", () => {
    const values = articleFormSchema.parse({
      title: "Nested form values",
      body: "The feature form can differ from the generated transport command.",
      publication: { status: "published" },
    });

    expect(mapArticleFormToCreateDto(values)).toEqual({
      title: "Nested form values",
      body: "The feature form can differ from the generated transport command.",
      status: "published",
    });
  });
});

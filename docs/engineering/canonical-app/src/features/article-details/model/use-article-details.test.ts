import { describe, expect, it } from "vitest";

import type { ArticleDto, ArticleListItemDto } from "@/api/generated/types.gen";

import { getArticleDetailsState } from "./use-article-details";

const preview: ArticleListItemDto = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Preview",
  excerpt: "Summary",
  status: "published",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
const details: ArticleDto = {
  ...preview,
  body: "A complete Article body for the ready state.",
  authorName: "Ada",
  createdAt: "2025-01-01T00:00:00.000Z",
};

describe("getArticleDetailsState", () => {
  it("keeps the preview while detail is loading", () => {
    expect(
      getArticleDetailsState({ value: preview, cachedPreview: preview, isError: false }),
    ).toEqual({ status: "loading", preview });
  });

  it("returns a single ready state for complete detail", () => {
    expect(
      getArticleDetailsState({ value: details, cachedPreview: preview, isError: false }),
    ).toEqual({ status: "ready", details });
  });

  it("preserves available data when the refresh errors", () => {
    expect(
      getArticleDetailsState({ value: details, cachedPreview: preview, isError: true }),
    ).toEqual({ status: "error", preview, details });
  });
});

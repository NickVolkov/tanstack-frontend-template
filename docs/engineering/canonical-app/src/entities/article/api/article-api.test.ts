import { describe, expect, it } from "vitest";

import { createServerApi } from "@/shared/api";

describe("generated Article client with MSW", () => {
  it("keeps list summaries distinct from complete details", async () => {
    const { ArticlesService } = createServerApi();
    const list = await ArticlesService.listArticles({ query: { page: 1, limit: 10 } });
    const summary = list.data?.items[0];

    expect(summary).toBeDefined();
    expect(summary).not.toHaveProperty("body");

    const detail = await ArticlesService.getArticle({
      path: { articleId: summary!.id },
    });
    expect(detail.data).toMatchObject({ id: summary!.id });
    expect(detail.data).toHaveProperty("body");
  });
});

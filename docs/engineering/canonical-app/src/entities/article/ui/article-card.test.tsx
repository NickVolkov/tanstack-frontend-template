import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArticleCard } from "./article-card";

describe("ArticleCard", () => {
  it("opens details by identifier instead of passing the DTO", () => {
    const onOpen = vi.fn<(articleId: string) => void>();
    render(
      <MantineProvider>
        <ArticleCard
          article={{
            id: "article-id",
            title: "Cache entries are projections",
            excerpt: "Summary",
            status: "published",
            updatedAt: "2026-01-01T00:00:00.000Z",
          }}
          onOpen={onOpen}
        />
      </MantineProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /read full article/i }));
    expect(onOpen).toHaveBeenCalledWith("article-id");
  });
});

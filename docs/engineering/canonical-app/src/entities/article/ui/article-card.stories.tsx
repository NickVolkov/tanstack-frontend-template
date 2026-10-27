import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ArticleCard } from "./article-card";

const meta = {
  title: "Entities/ArticleCard",
  component: ArticleCard,
  args: {
    article: {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Cache entries are projections",
      excerpt: "A list summary can be useful without pretending to be full detail.",
      status: "published",
      updatedAt: "2026-01-05T12:00:00.000Z",
    },
    onOpen: fn(),
  },
} satisfies Meta<typeof ArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Published: Story = {};
export const Draft: Story = {
  args: { article: { ...meta.args.article, status: "draft" } },
};

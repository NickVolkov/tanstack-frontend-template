import type {
  ArticleDto,
  ArticleListItemDto,
  ArticleListResponseDto,
  CreateArticleDto,
  UpdateArticleDto,
} from "@/api/generated/types.gen";

const seed: ArticleDto[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Cache entries are projections",
    excerpt: "Why list summaries and full details must remain independent.",
    status: "published",
    body: "A query key identifies both where data came from and which shape was returned. A list summary can render a useful preview, but it cannot become authoritative detail data.",
    authorName: "Ada Reed",
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-05T12:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Pull previews, push details",
    excerpt: "Use placeholderData for partial data and setQueryData for complete responses.",
    status: "published",
    body: "Pull a preview from the list cache when opening a detail view. Push into the detail cache only when an API or mutation has returned the complete detail representation.",
    authorName: "Lin Park",
    createdAt: "2026-01-06T09:00:00.000Z",
    updatedAt: "2026-01-07T09:30:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Invalidate what you cannot prove",
    excerpt: "Filtered lists make manual cache surgery deceptively fragile.",
    status: "draft",
    body: "When a mutation can affect an unknown set of filters and pages, invalidate the appropriate key family. The active views will refetch from their source of truth.",
    authorName: "Mira Cole",
    createdAt: "2026-01-08T08:00:00.000Z",
    updatedAt: "2026-01-08T08:00:00.000Z",
  },
];

let articles = structuredClone(seed);

function toSummary(article: ArticleDto): ArticleListItemDto {
  const { id, title, excerpt, status, updatedAt } = article;
  return { id, title, excerpt, status, updatedAt };
}

export function resetArticles() {
  articles = structuredClone(seed);
}

export function listMockArticles({
  page,
  limit,
  status,
  search,
}: {
  page: number;
  limit: number;
  status?: "draft" | "published";
  search?: string;
}): ArticleListResponseDto {
  const normalizedSearch = search?.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    if (status && article.status !== status) return false;
    if (normalizedSearch && !article.title.toLowerCase().includes(normalizedSearch)) {
      return false;
    }
    return true;
  });
  const start = (page - 1) * limit;
  return {
    items: filtered.slice(start, start + limit).map(toSummary),
    meta: {
      page,
      limit,
      total: filtered.length,
      hasNext: start + limit < filtered.length,
    },
  };
}

export function getMockArticle(articleId: string) {
  return articles.find((article) => article.id === articleId);
}

export function createMockArticle(input: CreateArticleDto): ArticleDto {
  const now = new Date().toISOString();
  const article: ArticleDto = {
    id: crypto.randomUUID(),
    title: input.title,
    body: input.body,
    excerpt: `${input.body.slice(0, 72)}${input.body.length > 72 ? "…" : ""}`,
    status: input.status,
    authorName: "Template Author",
    createdAt: now,
    updatedAt: now,
  };
  articles.unshift(article);
  return article;
}

export function updateMockArticle(
  articleId: string,
  input: UpdateArticleDto,
): ArticleDto | undefined {
  const index = articles.findIndex((article) => article.id === articleId);
  if (index < 0) return undefined;
  const current = articles[index];
  if (!current) return undefined;
  const next = {
    ...current,
    ...input,
    excerpt: input.body
      ? `${input.body.slice(0, 72)}${input.body.length > 72 ? "…" : ""}`
      : current.excerpt,
    updatedAt: new Date().toISOString(),
  };
  articles[index] = next;
  return next;
}

export function deleteMockArticle(articleId: string): boolean {
  const next = articles.filter((article) => article.id !== articleId);
  const deleted = next.length !== articles.length;
  articles = next;
  return deleted;
}

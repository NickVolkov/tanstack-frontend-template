# Queries and generated API clients

This document describes the standardized approach to data fetching and state management using TanStack Query in this frontend application.

## Overview

The queries approach centralizes data fetching logic in entity-specific query
files. Each entity has a `.queries.ts` file that exports query-option factories.
The generated transport client is infrastructure; entity query factories define
cache identity, projection mapping, and the contract consumed by UI code.

Read [server-state-cache.md](./server-state-cache.md) with this guide. It defines
the non-negotiable rules for list/detail projections, placeholder data, cache
seeding, invalidation, infinite pages, and session cleanup. The canonical Article
implementation is under `canonical-app/src/entities/article`.

## Core Patterns

### 1. Query Factory Pattern

Each entity defines a query factory object that contains methods for different query types:

```ts
// article.queries.ts
export const articleQueries = {
  list: (service: ArticlesService, params: ArticleListQuery) => queryOptions({/* ... */}),
  detail: (service: ArticlesService, id: string) => queryOptions({/* ... */}),
};
```

### 2. Query Key Management

Query keys are managed using a factory function that ensures consistency:

```ts
// query-keys-factory.ts
export function keysFactory(entity: string) {
  return {
    list: <T>(params?: T) => [entity, "list", params] as const,
    detail: (id: string) => [entity, "detail", id],
    custom: (...args: string[]) => [entity, ...args],
  };
}

// Usage in queries
const articleKeys = keysFactory("articles");
// articleKeys.list() => ['articles', 'list']
// articleKeys.detail('123') => ['articles', 'detail', '123']
```

### 3. Query Options Pattern

Queries are defined using TanStack Query's `queryOptions` and `mutationOptions`:

```ts
list: (service: ArticlesService, params: ArticleListQuery) =>
  infiniteQueryOptions({
    queryKey: articleKeys.list(params),
    queryFn: async ({ pageParam }) => {
      // API call
      const { data } = await service.getArticles({ query: params });
      return data;
    },
    select: ({ pages }) => ({
      // Transform data
      items: pages.flatMap((page) => page.items?.map(mapItem) ?? []),
    }),
  });
```

### 4. Data Transformation

Data transformation is handled in mapper functions:

```ts
// article.mapper.ts
export function mapArticle(apiArticle: ApiArticle): Article {
  return {
    id: apiArticle.articleId,
    name: apiArticle.title,
    // ...
  };
}
```

### 5. Mutation Patterns

Mutations follow a consistent pattern with automatic cache invalidation:

```ts
create: (service: ArticlesService, queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: async (data: CreateArticleRequest) => {
      const response = await service.postArticles({ body: data });
      return response.data;
    },
    onSuccess: async (article) => {
      queryClient.setQueryData(articleKeys.detail(article.id), article);
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: articleKeys.list() });
    },
  });
```

## Usage Patterns

### In Components

```ts
// Using queries in components
function ArticleList() {
  const { data, isLoading } = useInfiniteQuery(articleQueries.list({ status: 'published' }));

  if (isLoading) return <Loading />;

  return <ArticleGrid articles={data?.items} />;
}

// Using mutations
function CreateArticleForm() {
  const { mutate, isPending } = useMutation(articleQueries.create());

  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        // Handle success
      }
    });
  };

  return <Form onSubmit={handleSubmit} disabled={isPending} />;
}
```

## Best Practices

1. **Always use query-option factories** for consistent definitions usable by hooks, loaders, prefetching, and tests
2. **Handle data transformation** in mapper functions outside of query functions
3. **Use proper query keys** with the keys factory
4. **Implement cache invalidation** in mutations when data changes
5. **Use select transformers** to shape data for components
6. **Handle pagination** with infiniteQuery when needed
7. **Add error handling** in query functions when necessary

## Advanced Patterns

### Cache prepopulation

`setQueryData(detailKey, value)` is valid only when `value` is the complete,
authoritative detail projection. A list preview must never be written under a
detail key. If a mutation returns the full Article detail, seed it directly:

```ts
const detail = await service.postArticles({ body });
queryClient.setQueryData(articleKeys.detail(detail.id), detail);
```

If list and detail have different DTOs, pull the preview from list caches and
pass it to the detail query as `placeholderData`. See
[server-state-cache.md](./server-state-cache.md) and the canonical
`use-article-details.ts` implementation.

### Placeholder Data

```ts
queryOptions({
  queryKey: articleKeys.detail(articleId),
  queryFn: () => service.getArticle({ path: { articleId } }),
  placeholderData: preview,
});
```

`placeholderData` is observer data, not a successful detail-cache write. An
existing full detail-cache value takes precedence over the preview.

### Idempotency Keys

```ts
mutationOptions({
  mutationFn: async (data) => {
    const response = await apiService.create(data, {
      headers: {
        "Idempotency-Key": uuid(),
      },
    });
    return response.data;
  },
});
```

Generate an idempotency key once per user intent, outside retryable request
execution. Reusing the same key for retries prevents duplicate writes.

## Generated client and SSR boundary

Generated files under `src/shared/api/generated` are read-only outputs. The
`shared/api` segment owns their public interface and wraps them with:

- a browser client configured for browser credentials and base URL;
- a request-scoped server client that forwards only explicitly allowed request
  headers;
- router context containing the service surface consumed by query factories.

Do not import a browser singleton from entity query files. That leaks cookies
between rendering environments and makes loaders, SSR, and tests depend on a
global transport. Regenerate the client after OpenAPI changes and fail CI when
generated outputs drift.

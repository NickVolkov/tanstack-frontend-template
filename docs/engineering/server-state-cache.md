# Server-state cache

TanStack Query stores server state as `queryKey → data`; it does not normalize entities automatically. A list response and a detail response are separate cache entries even when both contain the same identifier.

## Query keys encode source and shape

Every input that changes the result belongs in the key. Different projections get different branches:

```ts
["articles", "list", "infinite", params][("articles", "detail", articleId)];
```

Never treat an `ArticleListItemDto` as an `ArticleDto`. A summary may lack fields, permissions or freshness guarantees available only from the detail endpoint. See [TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys).

## Pull previews; push complete details

When opening a detail view, synchronously pull a matching preview from existing list queries and pass it as `placeholderData`. The observer can render common fields immediately while the detail request runs. Placeholder data is not persisted as a successful detail result.

Use `setQueryData` only with a complete, authoritative detail returned by an API or mutation. Prefer a typed helper such as `seedArticleDetail(queryClient, article)` so a summary cannot be passed accidentally.

Decision table:

| Knowledge after an operation     | Action                                              |
| -------------------------------- | --------------------------------------------------- |
| Partial list projection          | `placeholderData`                                   |
| Complete authoritative detail    | typed `setQueryData` helper                         |
| Consequences are not fully known | `invalidateQueries` on the narrowest correct prefix |

See [Placeholder Query Data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data), [Updates from Mutation Responses](https://tanstack.com/query/latest/docs/framework/react/guides/updates-from-mutation-responses), and [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation).

## Infinite lists are page collections

An infinite entry is shaped as `InfiniteData<PageDto, PageParam>`, not a flat array. Search every `pages[].items`. Multiple filtered lists may coexist, so inspect the whole list family and prefer the most recently updated entry when duplicates exist.

Do not use `useQueries` to obtain a cached preview. There is still one network request—the detail query. Read existing list cache synchronously through `QueryClient`.

## Mutations

If create or update returns a full `ArticleDto`, seed its detail entry and invalidate the list family. Invalidation is safer than manually rewriting every filtered and paginated list. Delete removes the known detail entry and invalidates lists. Use a wider prefix only when the mutation's consequences are genuinely wider.

## UI contract

Hide cache orchestration in a feature hook and return one discriminated union:

```ts
type ArticleDetailsState =
  | { status: "loading"; preview?: ArticleListItemDto }
  | { status: "ready"; details: ArticleDto }
  | { status: "error"; preview?: ArticleListItemDto; details?: ArticleDto };
```

Render from `data.status`; do not construct a second state machine from unrelated `isLoadingDetails`, `details`, and `preview` flags.

## Session boundary

On logout or account switch, cancel in-flight private queries and remove their entries before another session can render. Preserve public cache only through an explicit predicate. Set the authentication entry to the unauthenticated value separately when the application has one.

## Non-negotiable invariants

- A summary is never written under a detail key.
- Query parameters that affect data always affect the key.
- Existing complete detail wins over a list preview.
- Cache updates are immutable.
- Session-scoped data does not survive the session boundary.

The executable implementation is in `canonical-app/src/entities/article/model/article.queries.ts` and `canonical-app/src/features/article-details/model/use-article-details.ts`.

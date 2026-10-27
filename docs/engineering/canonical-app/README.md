# Canonical Article app

This app is an executable reference for the frontend engineering guides. It intentionally uses separate list and detail DTOs so cache behavior cannot be hidden by identical shapes.

```sh
pnpm install
pnpm generate
pnpm dev
```

MSW supplies a deterministic API in development and tests. Set `VITE_ARTICLE_SCENARIO=empty` or `error` to exercise list states.

Important paths:

- `src/entities/article/model/article.queries.ts`: key hierarchy, infinite queries, preview lookup and typed detail seeding.
- `src/features/article-details/model/use-article-details.ts`: pull/placeholder workflow and UI state union.
- `src/entities/article/model/article.mutations.ts`: seeding and invalidation after mutations.
- `src/shared/lib/session-cache.ts`: session-boundary cache cleanup.

This is reference code, not a package imported by the root app. Copy the pattern that matches the change; do not depend on this workspace at runtime.

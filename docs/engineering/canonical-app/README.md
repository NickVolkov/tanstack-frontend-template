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
- `src/shared/modal/modal-context.tsx`: Odes-derived typed modal factory, HOC composition, and transition-safe parameter cleanup.
- `src/features/article-details/ui/article-details-modal.tsx`: parameterized modal that passes an identifier and resolves its own server state.
- `src/features/article-editor/ui/article-editor-modal.tsx`: parameterless form modal with Zod validation in TanStack Form state.

This is reference code, not a package imported by the root app. Copy the pattern that matches the change; do not depend on this workspace at runtime.

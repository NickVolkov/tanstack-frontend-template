# TanStack Frontend Repository Instructions

These tracked instructions are authoritative for this repository. Existing code may predate the target architecture; treat deviations as debt, not precedent.

## Required reading

- Before planning, writing, or reviewing application code, read [`docs/engineering/frontend-guidelines.md`](docs/engineering/frontend-guidelines.md).
- When changing query keys, queries, mutations, DTO projections, pagination, cache updates, SSR hydration, or session cleanup, also read [`docs/engineering/server-state-cache.md`](docs/engineering/server-state-cache.md).
- For forms, overlays, or collection screens, read the corresponding guide under `docs/engineering` and compare the change with the executable [`canonical-app`](docs/engineering/canonical-app/README.md).

## Hard boundaries

- Follow the dependency direction `app → pages → widgets → features → entities → shared`. Import another slice through its root `index.ts`; import Shared through a segment `index.ts` such as `@/shared/api` or `@/shared/form`.
- Keep server state in TanStack Query. Keep ephemeral interaction state local. Do not duplicate query data in a global client store.
- A query key identifies both the source and the shape of data. List summaries and detail DTOs are distinct projections and must not share cache entries.
- Never seed a detail cache entry with a partial list DTO. Use `placeholderData` for previews and `setQueryData` only for complete, authoritative responses.
- Browser API clients may be singletons. Server API clients must be request-scoped and must not leak headers, cookies, cache, or mutable configuration across requests.
- Generated files are read-only. Change their schema or generator configuration and regenerate them.

## Workflow

- Use `pnpm` and the scripts in `package.json`.
- Use `oxfmt` and `oxlint`; do not add Prettier or ESLint without an explicit repository decision.
- Preserve unrelated working-tree changes.
- For TypeScript changes run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and the narrowest relevant Vitest tests.
- For OpenAPI changes regenerate the API and mock spec, then verify the generated diff.
- For documentation-only changes validate links and run `git diff --check`.

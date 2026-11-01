# Canonical Article app

This app is an executable reference for the frontend engineering guides. It intentionally uses separate list and detail DTOs so cache behavior cannot be hidden by identical shapes.

```sh
pnpm install
pnpm generate
pnpm dev
```

MSW supplies a deterministic API in development and tests. Set `VITE_ARTICLE_SCENARIO=empty` or `error` to exercise list states.

Important paths:

- `src/shared/api`: generated client plus browser and request-scoped server adapters behind one segment public API.
- `src/app/router/app-router.tsx`: app-wide router, provider, API-context, and QueryClient composition.
- `src/entities/article/model/article.queries.ts`: key hierarchy, infinite queries, preview lookup and typed detail seeding.
- `src/features/article-details/model/use-article-details.ts`: pull/placeholder workflow and UI state union.
- `src/entities/article/model/article.mutations.ts`: seeding and invalidation after mutations.
- `src/shared/lib/session-cache.ts`: session-boundary cache cleanup.
- `src/shared/modal/modal-context.tsx`: Odes-derived typed modal factory, HOC composition, and transition-safe parameter cleanup.
- `src/features/article-details/ui/article-details-modal.tsx`: parameterized modal that passes an identifier and resolves its own server state.
- `src/features/article-editor/model`: editor-owned schemas, form options, command mapping, and mutation orchestration.
- `src/features/article-editor/ui/article-editor-modal.tsx`: parameterless modal using the Odes onboarding pattern: one root form, `withForm` step components, and step-local `FormGroup` validation.
- `src/shared/form`: Odes-derived `createFormHook` setup, one shared context pair, registered input/textarea/select fields, and `FieldHOC` UI adapters.

This is reference code, not a package imported by the root app. Copy the pattern that matches the change; do not depend on this workspace at runtime.

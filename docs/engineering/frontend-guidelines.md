# Frontend engineering guidelines

This is the full project adaptation of the reusable `frontend-engineer` guide. It
keeps the original architecture and implementation patterns, while making the
template decisions explicit: TanStack Start and Router, TanStack Query and Form,
Zod, generated Hey API clients, Mantine, MSW, Storybook, Oxfmt, and Oxlint.

The runnable [canonical Article application](./canonical-app/README.md) is the
executable reference. When an abbreviated snippet in these guides differs from
that application, follow the canonical application and update the guide.

## Core Concepts

### 1. Feature-Driven Architecture

The application follows a feature-driven architecture with the following structure:

```
src/
├── app/              # App-wide providers, router implementation, and global styles
├── routes/           # Thin TanStack file-route adapters required by the framework
├── pages/            # Page slices that compose widgets and features
├── widgets/          # Reusable, self-contained page blocks
├── features/         # User-facing business actions and workflows
├── entities/         # Business entities (models, queries, mappers)
└── shared/           # Business-agnostic API, UI, and library segments
```

### 2. Entity Layer Pattern

Entities represent business objects with three core components. Each entity is contained in its own directory with files named using the entity name as a prefix:

#### Model

Defines TypeScript types for the entity:

```ts
// File: article.model.ts
export type Article = {
  id: string;
  name: string;
  status: ArticleStatus;
};

export enum ArticleStatus {
  Draft = "draft",
  Published = "published",
}
```

#### Queries

Handles server-state fetching using TanStack Query. Query factories receive an
API service rather than importing a browser singleton, so the same options work
during SSR and in the browser:

```ts
// File: article.queries.ts
export const articleQueries = {
  list: (service: ArticlesService) => queryOptions({/* ... */}),
  detail: (service: ArticlesService, id: string) => queryOptions({/* ... */}),
};
```

#### Mapper

Transforms API data to match the model:

```ts
// File: article.mapper.ts
export function mapArticle(apiArticle: ApiArticle): Article {
  return {
    id: apiArticle.articleId,
    name: apiArticle.title,
    status: apiArticle.state,
  };
}
```

### 3. Feature Layer Pattern

Features implement specific business capabilities and follow these principles:

- Self-contained with clear boundaries
- Use entities for data operations
- Export reusable UI components
- Handle their own state management

Structure:

```
features/
└── feature-name/
    ├── ui/           # UI components specific to this feature
    ├── model/        # Workflow state, schemas, orchestration, and business logic
    ├── api/          # Feature-specific API hooks (optional)
    └── lib/          # Feature-specific utilities (optional)
```

### 4. API integration pattern

API integration follows these conventions:

- Generated API clients from Swagger/OpenAPI specs
- A request-scoped server client and browser client behind the same router context seam
- Type-safe request/response contracts
- Consistent error handling

### 5. Routing pattern

Application routing uses:

- TanStack Router file routes and typed navigation
- Thin `src/routes` files that import page slices through their public APIs
- Route loaders that consume query options from entities
- Route-based code splitting

### 6. State Management Pattern

State management is implemented with:

- TanStack Query for server state
- Custom contexts for client state
- Key factory pattern for query invalidation
- Selectors for data transformation

### 7. UI Component Patterns

UI components follow these principles:

- Composition over inheritance
- Separation of presentation and logic
- Reusable table components with column definitions
- Consistent skeleton/loading states
- Error and empty state handling

## Development Conventions

### Naming Conventions

- Files: kebab-case (`article-player.tsx`) with entity name prefix for entity files (`media.queries.ts`, `user.model.ts`)
- Components: PascalCase (`ArticlePlayer`)
- Functions: camelCase (`getArticleDuration`)
- Constants: UPPER_SNAKE_CASE (`MAX_VIDEO_SIZE`)

### File Structure

- One main export per file
- Related files grouped in folders
- Index files for easy imports
- Barrel exports for public APIs

### Dependency direction and imports

Use the `@/*` alias for imports across `src/`; keep short relative imports
inside one local slice. Dependencies point downward:

```text
app/routes → pages → widgets → features → entities → shared
```

Lower layers must not import higher layers, and slices on the same layer remain
independent. A slice exposes one public API from its root `index.ts`. Shared and
App have segments rather than slices, so consumers import their segment public
APIs, for example `@/shared/api`, `@/shared/form`, and `@/app/router`.

Framework-required root files (`client.tsx`, `server.ts`, `router.tsx`, generated
route trees, and file routes) are entrypoint adapters. Keep them thin: app-wide
implementation belongs in `app`, while route UI belongs in a `pages` slice.

## Testing Approach

- Unit tests for pure functions and components
- Integration tests for hooks and complex logic
- Mock API responses for data layer testing
- Coverage reporting with thresholds

## Build and Deployment

- TypeScript for type checking
- Oxfmt for deterministic formatting
- Type-aware Oxlint and TypeScript for static checks
- Generated-code drift checks in CI

## Detailed Implementation Guides

For more detailed information on specific implementation approaches, see:

- [Queries and API](./queries-and-api.md) - data fetching, generated clients, and state management
- [Server-state cache](./server-state-cache.md) - list/detail projections, placeholder data, seeding, and session boundaries
- [Modals](./modals.md) - the canonical Odes modal factory and composition pattern
- [Forms](./forms.md) - form system and validation
- [Lists](./lists.md) - list components, pagination, filtering, and states
- [Testing](./testing.md) - executable architecture and testing boundaries
- [Anti-patterns](./anti-patterns.md) - prohibited shortcuts and their replacements

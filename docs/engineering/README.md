# Frontend engineering

This document provides an overview of the key architectural approaches used in this frontend application.

## Core Approaches

### 1. Queries ([queries-and-api.md](./queries-and-api.md))

- Data fetching and state management using TanStack Query
- Query factory pattern with centralized query definitions
- Automatic cache management and invalidation
- Integration with generated API clients

### 2. Modals ([modals.md](./modals.md))

- Context-based modal system with factory patterns
- Parameterized modals with consistent APIs
- Integration with form system for form-based modals
- Automatic state management and cleanup

### 3. Forms ([forms.md](./forms.md))

- Custom form system built on TanStack Form
- Zod schema validation with clear error messages
- Higher-order components for field abstraction
- Query-bound forms for URL synchronization

### 4. Lists ([lists.md](./lists.md))

- Query-based lists with skeleton loading states
- Integrated filtering with URL parameter binding
- Consistent handling of loading, error, and empty states
- Infinite scrolling for large datasets

## Integration Patterns

These approaches work together to create a cohesive architecture:

1. **Lists → Queries**: Lists consume query hooks for data fetching
2. **Forms → Modals**: Forms are often displayed within modals
3. **Forms → Queries**: Forms use mutation hooks to modify data
4. **Filters → Forms**: List filters are implemented as forms
5. **Modals → Queries**: Modals often trigger mutations that invalidate queries

## Best Practices

1. **Consistency**: Follow established patterns for each approach
2. **Separation of Concerns**: Keep data fetching, UI, and business logic separate
3. **State Management**: Leverage TanStack Query for server state, React Context for client state
4. **User Experience**: Provide loading states, error handling, and clear feedback
5. **URL Synchronization**: Bind filter forms to query parameters for shareable URLs

## Required reading by task

- Start with [frontend-guidelines.md](./frontend-guidelines.md) for layer boundaries, naming, generated API ownership, routing, state, and tooling.
- For any query, mutation, list, detail view, or session change, read [queries-and-api.md](./queries-and-api.md) and [server-state-cache.md](./server-state-cache.md).
- For modal or drawer work, read [modals.md](./modals.md); the Odes-derived factory and Article usage are canonical.
- For form or filter work, read [forms.md](./forms.md) and [lists.md](./lists.md).
- Before adding a shortcut, check [anti-patterns.md](./anti-patterns.md).
- For verification boundaries, read [testing.md](./testing.md).

## Executable reference

[`canonical-app`](./canonical-app/README.md) is a runnable Article vertical slice covering generated OpenAPI clients, SSR/browser client seams, query factories, list/detail projections, infinite queries, mutation cache updates, Zod/TanStack Form, the context-modal factory, MSW, component tests, and Storybook. Documentation examples explain the patterns; the canonical app proves they compile and interact correctly.

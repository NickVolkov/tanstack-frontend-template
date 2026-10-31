# Anti-patterns

## Cache and API

- Writing a list item into a detail cache entry.
- Omitting filters, sorting or pagination inputs from a query key.
- Hand-editing generated clients.
- Sharing a mutable authenticated API client between SSR requests.
- Updating every filtered list manually after an uncertain mutation.
- Copying query results into Zustand, Context or component state.

## Components and features

- Passing full DTOs through modal parameters instead of identifiers.
- Clearing modal parameters when closing begins instead of after the exit transition.
- Hand-mounting feature providers and modal components at every caller instead of exporting a composed HOC.
- Building UI state from contradictory combinations of query flags.
- Calling transport services from presentational components.
- Importing another slice's internal file instead of its public API.
- Moving orchestration into `shared` merely to make an import legal.

## Forms and lists

- Using server DTO validation as the only client input validation.
- Mirroring TanStack Form validation or mutation errors into an extra React state.
- Calling `createFormHookContexts()` separately for the form factory and registered fields.
- Putting domain validation inside a generic `FieldHOC` UI adapter.
- Resetting a form before mutation success.
- Treating an infinite query as a flat array in cache helpers.
- Replacing rendered pages with a global spinner during pagination.

When an exception is justified, record the reason at the boundary; do not weaken the rule for the entire repository.

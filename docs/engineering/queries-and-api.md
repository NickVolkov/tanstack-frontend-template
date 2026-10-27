# Queries and API clients

Generate transport types and SDK functions from OpenAPI. Generated output is read-only and committed so contract changes remain reviewable.

Entity query factories accept the smallest client interface they need rather than importing a global transport singleton. This keeps SSR request scoping and tests explicit.

Use `queryOptions` and `infiniteQueryOptions` factories to colocate key, function and caching defaults. Define key families from broad to narrow so invalidation can target `all`, `lists`, or one `detail` deliberately.

Browser clients may share configuration. Server clients must be constructed for each request. Never attach a request cookie to a module singleton.

Throw when the generated client returns an error or missing required data. UI-facing hooks translate transport/query state into domain-oriented states.

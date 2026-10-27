# Frontend guidelines

## Architecture

Use the dependency direction:

```text
app → pages → widgets → features → entities → shared
```

Higher layers compose lower layers. A layer must not import upward. Slices on the same layer do not reach into each other's internals. Every slice exposes a deliberately small public API through `index.ts`; implementation files stay private.

Prefer deep modules: keep query orchestration, transport mapping and error interpretation behind a narrow hook or factory. A component should consume a domain-oriented state, not rebuild cache behavior from flags and raw DTOs.

## Responsibilities

- `app`: providers, router construction, global styles and composition.
- `pages`: route-level composition and page layout.
- `widgets`: reusable page sections that coordinate multiple features.
- `features`: user intentions such as creating or opening an Article.
- `entities`: domain data, query factories, mutations, mappers and entity UI.
- `shared`: provider-agnostic infrastructure and reusable primitives with no domain vocabulary.

Keep transport DTOs at the entity API boundary. Map them when the UI needs stable domain semantics. Do not put network calls directly in page components.

## State placement

- TanStack Query owns server state.
- A form owns draft input until submission.
- Component state owns short-lived visual state.
- The URL owns navigable state such as filters, sorting, pagination and selected identifiers when deep linking matters.
- Context is for a bounded coordination seam, not a default global store.

## SSR

Create one QueryClient per router/request. A browser API client may be a singleton; a server API client must be constructed per request. Forward only explicitly required headers. Never mutate a module-level server client with request credentials.

Start independent work together and await it at the latest responsible boundary. Avoid request waterfalls in route loaders.

## Public interfaces

Export use cases and stable types, not folder structure. If a consumer needs three internal imports to perform one user action, deepen the producing module.

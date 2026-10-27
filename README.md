# TanStack frontend template

A reusable baseline for SSR-capable React applications with TanStack Start, Router, Query and Form, Mantine, generated OpenAPI clients, MSW, Storybook, Vitest and the Oxc toolchain.

## Start a project

After this repository is published:

```sh
npx scaffoldrr create NickVolkov/tanstack-frontend-template my-app
cd my-app
pnpm dev
```

The root is intentionally a minimal product shell. Architecture examples live in the independently executable [`docs/engineering/canonical-app`](docs/engineering/canonical-app/README.md).

## Local checks

```sh
pnpm check
```

The root and canonical app have separate pnpm workspaces and lockfiles. This mirrors how the engineering documentation can be copied or updated without turning the generated application into a monorepo.

See [`docs/engineering/README.md`](docs/engineering/README.md) before adding production features.

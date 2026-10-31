# Modals approach

This guide preserves the complete context-modal pattern from the original
`frontend-engineer` material and makes the Odes implementation canonical. The
executable source lives in
`canonical-app/src/shared/modal/modal-context.tsx`; feature usage lives in the
Article details and editor slices.

## Overview

A modal is a feature-level state machine, not a boolean owned by whichever
button happened to open it. The factory supplies:

- one context for open state and parameters;
- a feature hook with `open`, `close`, `toggle`, and parameter operations;
- a UI-library adapter with a small `ModalBaseProps` contract;
- HOCs that colocate provider setup and modal mounting at a composition root;
- delayed parameter cleanup after the exit transition.

The feature exports `useArticleDetailsModal` and `withArticleDetailsModal`.
Callers do not import the context, provider, or Mantine modal directly.

## Base component contract

The factory is independent of Mantine, a bottom sheet, or another dialog
implementation. Every adapter implements the same boundary:

```ts
export type ModalBaseProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCloseEnd?: () => void;
  children: ReactNode;
};
```

The canonical Mantine adapter translates this contract:

```tsx
export function MantineContextModal({
  isOpen,
  onOpenChange,
  onCloseEnd,
  children,
  ...props
}: MantineContextModalProps) {
  return (
    <Modal
      {...props}
      opened={isOpen}
      onClose={() => onOpenChange(false)}
      onExitTransitionEnd={onCloseEnd}
    >
      {children}
    </Modal>
  );
}
```

`onCloseEnd` must mean "the exit animation is finished", not "the user asked
to close". That distinction keeps content and params available during the exit
animation and prevents a visible empty-state flash.

## Context factory

The canonical factory is the implementation from Odes. Its complete API is:

```ts
const { ModalContext, ModalContextProvider, Modal, useModal, withProvider, withModal } =
  createContextModal({
    name: "ArticleDetails",
    ModalComponent: MantineContextModal,
    getInitialParams: () => ({ articleId: null }),
  });
```

The context state is deliberately small:

```ts
type ModalState<P> = {
  isOpen: boolean;
  params: P;
};
```

For a parameterless modal, omit `getInitialParams`; the hook exposes:

```ts
{
  (isOpen, open, close, toggle);
}
```

For a parameterized modal, return a non-null parameter object; the hook exposes:

```ts
{
  isOpen,
  params,
  open,
  close,
  toggle,
  onOpenChange,
  setParams,
  clearParams,
}
```

`setParams` merges a `Partial<P>` into current params. `close` changes only
`isOpen`; `clearParams` resets params with `getInitialParams`.

## Parameter lifecycle

Opening, closing, and cleanup are separate transitions:

1. `open(params)` stores params and opens the modal.
2. `close()` sets `isOpen` to false but preserves params.
3. The UI adapter runs its exit animation while content can still read params.
4. The adapter calls `onCloseEnd`.
5. The factory calls `clearParams()` and then the feature's `onCloseEnd`.

Never clear params in `close()`. Never use an effect watching `isOpen` for
cleanup: it fires before the animation completes and couples lifecycle semantics
to rendering timing.

The transition callback uses `useRefCallback`. Its identity is stable, while it
always invokes the latest handler. This avoids restarting transition internals
when a parent renders and avoids stale closures when the transition finishes.

## Parameterized Article details modal

Pass stable identifiers, not cached DTO objects. The content resolves its own
server state from the identifier, so it can use the list preview as
`placeholderData` and then fetch the authoritative detail projection.

```tsx
type ArticleDetailsModalParams = { articleId: string | null };

const { useModal, withModal } = createContextModal({
  name: "ArticleDetails",
  ModalComponent: MantineContextModal,
  getInitialParams: (): ArticleDetailsModalParams => ({ articleId: null }),
});

function ArticleDetailsModalRoot() {
  const { params } = useModal();
  if (!params.articleId) return null;
  return <ArticleDetailsContent articleId={params.articleId} />;
}

export { useModal as useArticleDetailsModal };
export const withArticleDetailsModal = withModal(ArticleDetailsModalRoot, {
  title: "Article details",
  size: "lg",
});
```

Opening it from another component is intentionally small:

```tsx
function ArticleCardActions({ articleId }: { articleId: string }) {
  const { open } = useArticleDetailsModal();
  return <Button onClick={() => open({ articleId })}>Details</Button>;
}
```

## Parameterless form modal

A create modal does not need synthetic `undefined` params. Omit
`getInitialParams`, render the form in the modal root, and close it only after a
successful mutation:

```tsx
const { useModal, withModal } = createContextModal({
  name: "ArticleEditor",
  ModalComponent: MantineContextModal,
});

function ArticleEditorModalRoot() {
  const { close } = useModal();
  return <ArticleEditorForm close={close} />;
}

export { useModal as useArticleEditorModal };
export const withArticleEditorModal = withModal(ArticleEditorModalRoot, {
  title: "New Article",
  size: "lg",
});
```

Form state remains inside TanStack Form. Mutation state remains inside TanStack
Query. The modal owns only visibility and modal parameters.

## `withModal` and `withProvider`

Both functions return HOCs. They do not render the page immediately.

### `withModal`

Use `withModal` for the common case. It creates the factory `Modal`, mounts the
feature content inside it, and delegates provider composition to `withProvider`:

```tsx
function withModal(Component: ComponentType, modalProps: ModalProps) {
  return withProvider(() => (
    <Modal {...modalProps}>
      <Component />
    </Modal>
  ));
}
```

### `withProvider`

Use `withProvider` when the mounted component needs custom structure, multiple
surfaces, or props that do not fit the standard wrapper:

```tsx
const CustomModalRoot = () => {
  const { params, close } = useModal();
  return <CustomDrawer itemId={params.id} onClose={close} />;
};

export const withCustomModal = withProvider(CustomModalRoot);
```

The HOC mounts the wrapped view and modal root as siblings under the same
provider:

```tsx
function withProvider(ModalRoot: ComponentType) {
  return function <P>(View: ComponentType<P>) {
    return function WithProvider(props: P) {
      return (
        <ModalContextProvider>
          <View {...props} />
          <ModalRoot />
        </ModalContextProvider>
      );
    };
  };
}
```

## Composition root

Compose feature modals at the narrowest common owner of all callers. In the
canonical page:

```tsx
export const ArticlesPage = withArticleDetailsModal(withArticleEditorModal(ArticlesScreen));
```

Application-wide modals may be composed at an authenticated layout, as in Odes.
Feature-local modals should not be lifted to the application root without need.
The nesting order defines provider scope, not visual z-index.

## Form-system integration

The original `frontend-engineer` system also used a `createFormModal` wrapper.
That wrapper is optional: it is useful only after several modal forms repeat the
same submit/cancel wiring. Its responsibilities are:

- create the feature form through a hook;
- connect modal submit to `form.handleSubmit()`;
- derive pending/disabled state from form and mutation state;
- reset the form after `onCloseEnd`, not when closing begins;
- pass the form instance to a `withForm` component.

Do not combine business form values with modal params. Params identify what the
modal operates on; form values describe the pending command.

## State and ownership rules

- Export feature-named hooks and HOCs; keep the raw factory result private.
- Put the factory invocation in the feature that owns the workflow.
- Put only stable routing/identity data in params (`articleId`, mode, optional
  return target). Do not pass a list DTO as detail data.
- A modal root may return `null` until required params exist.
- Server data stays in TanStack Query; do not copy it into modal context.
- Form data stays in TanStack Form; do not copy it into modal context.
- A URL-addressable workflow belongs in a route, not only in modal state.
- The modal adapter owns focus trapping, escape behavior, overlay semantics,
  accessible naming, and transition callbacks.

## Common failure modes

### Local boolean state at each trigger

This duplicates modal ownership, prevents distant callers from sharing one
instance, and scatters mounting. Use the feature hook and one composed HOC.

### Clearing params immediately

The closing content disappears before the transition ends. Preserve params in
`close` and reset them from `onCloseEnd`.

### Passing a DTO through params

The DTO becomes a second, stale source of server truth. Pass the identifier and
let the feature hook resolve preview/detail cache behavior.

### Rendering providers and modal components by hand

Manual provider trees drift and are easy to omit. Export a `withFeatureModal`
HOC and compose it at the appropriate page or layout boundary.

### One global modal registry

A registry hides feature ownership and encourages untyped cross-feature calls.
Prefer one typed factory per workflow and ordinary React composition.

## Component hierarchy

```text
withArticleDetailsModal(ArticlesScreen)
└── ArticleDetailsModalContextProvider
    ├── ArticlesScreen
    │   └── trigger -> useArticleDetailsModal().open({ articleId })
    └── ArticleDetails Modal
        └── ArticleDetailsModalRoot
            └── useArticleDetails(articleId)
                ├── list preview placeholder
                └── authoritative detail query
```

# Forms approach

This document describes the standardized approach to implementing forms in this frontend application.

## Overview

The forms approach uses TanStack Form with Zod validation. Use raw TanStack Form
for genuinely isolated forms. Introduce the application form hook, `withForm`,
field contexts, and `FieldHOC` patterns below when multiple forms share field
behavior; do not build an abstraction for a single field.

The canonical app includes the Odes form architecture under
`canonical-app/src/shared/form`. The Article editor uses `formOptions`,
`useAppForm`, `withForm`, registered fields, `FormGroup`, and
mutation-driven submission in a two-step flow.

### One context pair is a hard invariant

Call `createFormHookContexts()` exactly once for an application form system.
Both `createFormHook` and every `FieldHOC` must import `fieldContext`,
`formContext`, and their hooks from that same module:

```ts
// form-context.ts
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

// base-form.tsx
export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { FormInput, FormTextarea, FormSelect },
  formComponents: { Button },
  fieldContext,
  formContext,
});
```

Creating one context pair in `base-form.tsx` and another in `field-hoc.tsx`
produces components that compile but read a different provider at runtime. Keep
the contexts in a dependency-free `form-context.ts` to avoid circular imports.

## Core Patterns

### 1. Custom Form Hook

Forms are created using a custom `useForm` hook that extends TanStack Form:

In this template that hook is named `useAppForm` so it cannot be confused with
the raw TanStack hook:

```ts
// Custom form hook
export function useIssueApiKeyForm(tenantId: string) {
  const { mutateAsync: issueApiKey } = useMutation(apiKeysQueries.issueApiKey());
  const { successNotification, errorNotification } = useNotification();

  return useForm({
    ...formOpts,
    onSubmit: ({ value }) => {
      return issueApiKey({
        tenantId,
        comment: value.comment,
        expiringAt: value.date?.toISOString(),
      })
        .then((key) => {
          return navigator.clipboard.writeText(key!);
        })
        .then(() => {
          successNotification("Ключ выпущен и скопирован в буфер");
        })
        .catch(() => {
          errorNotification("Не удалось выпустить ключ");
        });
    },
  });
}
```

### 2. Form Options

Form configuration is defined using `formOptions` from TanStack Form:

```ts
const validationSchema = z.object({
  date: z
    .date()
    .nullable()
    .refine(
      (value) => value === null || value.getTime() > Date.now(),
      "Expiration date must be in the future",
    ),
  comment: z.string().trim().min(1, "Comment is required"),
});

const formOpts = formOptions({
  defaultValues: {
    date: null as Date | null,
    comment: "",
  },
  validators: {
    onSubmit: validationSchema,
  },
});
```

### 3. Form Components

Form components are created using the `withForm` higher-order component:

```ts
export const IssueApiKeyForm = withForm({
  ...formOpts,
  render: function IssueApiKeyForm({ form }) {
    return (
      <form.AppForm>
        <form.AppField name="date">
          {(field) => <field.DateInput outerLabel="Дата истечения" />}
        </form.AppField>
        <form.AppField name="comment">
          {(field) => <field.Textarea outerLabel="Комментарий" />}
        </form.AppField>
      </form.AppForm>
    );
  },
});
```

### 4. Field Higher-Order Components

Field components are created using the `FieldHOC` higher-order component:

```ts
// input.tsx
export const InputField = FieldHOC(InputDesktop, {
  extractValue: (e) => e.target.value,
  formatValue: (value) => value || "",
});
```

`FieldHOC` is responsible for mechanical field plumbing only: `name`, `value`,
`onChange`, `onBlur`, Enter submission, the first validation error, and
`aria-invalid`. Domain validation stays in Zod/form validators. `traitEmptyAsNull`
is an explicit boundary conversion for nullable API values; it must not become a
global empty-string policy.

Enter submission must be configurable per adapter. It is appropriate for a
single-line input and wrong for a textarea, where Enter inserts a newline. The
canonical `FormTextarea` sets `submitOnEnter: false`.

## Validation Patterns

### Schema validation with Zod

Keep the Zod schema at the entity boundary when it describes an entity command.
Infer the form value type from the schema so runtime and compile-time contracts
cannot drift:

```ts
import { z } from "zod";

export const articleFormSchema = z.object({
  currentStep: z.union([z.literal(1), z.literal(2)]),
  content: z.object({
    title: z.string().trim().min(3).max(120),
    body: z.string().trim().min(20),
  }),
  publication: z.object({ status: z.enum(["draft", "published"]) }),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
```

### Field-Level Validation

Field-level validation is handled automatically by the form system based on the schema.

### Custom Validation Logic

Custom validation logic uses `refine` or `superRefine`:

```ts
const isHolidayOrFriday = (value: Date) => {
  return isFederalHoliday(value) || isSunday(value) || isSaturday(value) || isFriday(value);
};

const validationSchema = z.object({
  date: z
    .date()
    .nullable()
    .refine(
      (value) => value === null || value.getTime() > Date.now(),
      "Expiration date must be in the future",
    )
    .refine(
      (value) => value === null || !isHolidayOrFriday(value),
      "Expiration date must be a business day",
    ),
});
```

## Usage Patterns

### Creating a Form Hook

```ts
export function useCreateTenantForm() {
  const { mutateAsync: createTenant } = useMutation(tenantQueries.create());
  const { successNotification, errorNotification } = useNotification();

  return useForm({
    ...formOpts,
    onSubmit: ({ value }) => {
      return createTenant(value as CreateTenantQuery)
        .then(() => {
          successNotification("Тенант успешно создан");
        })
        .catch(() => {
          errorNotification("Не удалось создать тенант");
        });
    },
  });
}
```

### Creating a Form Component

```ts
export const CreateTenantForm = withForm({
  ...formOpts,
  render: function CreateTenantForm({ form }) {
    return (
      <form.AppForm>
        <form.AppField name="name">
          {(field) => <field.Input outerLabel="Имя" />}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.Textarea outerLabel="Описание" traitEmptyAsNull />}
        </form.AppField>
      </form.AppForm>
    );
  },
});
```

### Using Forms in Modals

Forms are often used within modals:

```ts
// In modal component
export const withCreateTenantModal = withModal(
  ({ form }) => {
    return <CreateTenantForm form={form} />;
  },
  {
    title: 'Создать тенант',
    cancelText: 'Отменить',
    submitText: 'Создать',
  },
);
```

## Advanced Patterns

### Field Traits

Fields support special traits like `traitEmptyAsNull`:

```ts
<form.AppField name="description">
  {(field) => <field.Textarea outerLabel="Описание" traitEmptyAsNull />}
</form.AppField>
```

### Custom Fields

Custom fields can be created using the `FieldHOC`:

```ts
// Custom field example
import { CustomInputComponent } from "./custom-input-component";
import { FieldHOC } from "@/shared/ui/base-form/field-hoc";

export const CustomInputField = FieldHOC(CustomInputComponent, {
  extractValue: (value) => value,
  formatValue: (value) => value || "",
  isEmpty: (value) => !value,
});
```

### Form Context

Forms use React Context for state management:

```ts
const { fieldContext, formContext } = createFormHookContexts();
```

### Form groups and step flows

Do not use “nested form” for every field with a dot path. Keep these three
concepts distinct:

- A **nested value** is an object in the root form state, addressed by paths such
  as `content.title`.
- A **step component** is UI extracted with `withForm`. It receives the existing
  root form instance; it does not own validation or submission by itself.
- A **form group** is a TanStack Form validation and submission boundary over
  one nested value. `FormGroup` validates only that group and calls
  `onGroupSubmit` only when the active step is valid.

Use the Odes onboarding composition for a wizard or stepper: create exactly one
root form, keep every step's values in that form, render step UI with `withForm`,
and wrap the active step in a concretely typed `form.FormGroup`. Do not create a
`useAppForm` instance per step and do not use root `handleSubmit` merely to move
between steps.

```tsx
const articleContentSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(20),
});

const articlePublicationSchema = z.object({
  status: z.enum(["draft", "published"]),
});

const articleFormOptions = formOptions({
  defaultValues: {
    currentStep: 1 as 1 | 2,
    content: { title: "", body: "" },
    publication: { status: "draft" as const },
  },
  validators: { onSubmit: articleFormSchema },
});

const ArticleContentStep = withForm({
  ...articleFormOptions,
  render: function ArticleContentStep({ form }) {
    return (
      <>
        <form.AppField name="content.title">
          {(field) => <field.FormInput label="Title" />}
        </form.AppField>
        <form.AppField name="content.body">
          {(field) => <field.FormTextarea label="Body" />}
        </form.AppField>
      </>
    );
  },
});

const ArticlePublicationStep = withForm({
  ...articleFormOptions,
  render: function ArticlePublicationStep({ form }) {
    return (
      <form.AppField name="publication.status">
        {(field) => <field.FormSelect label="Status" data={["draft", "published"]} />}
      </form.AppField>
    );
  },
});

const ArticleEditorForm = withForm({
  ...articleFormOptions,
  render: ({ form }) => (
    <form.Subscribe selector={(state) => state.values.currentStep}>
      {(step) =>
        step === 1 ? (
          <form.FormGroup
            name="content"
            validators={{ onSubmit: articleContentSchema }}
            onGroupSubmit={() => form.setFieldValue("currentStep", 2)}
          >
            {(group) => (
              <>
                <ArticleContentStep form={form} />
                <button type="button" onClick={() => void group.handleSubmit()}>
                  Continue
                </button>
              </>
            )}
          </form.FormGroup>
        ) : (
          <form.FormGroup
            name="publication"
            validators={{ onSubmit: articlePublicationSchema }}
            onGroupSubmit={() => form.handleSubmit()}
          >
            {(group) => (
              <>
                <ArticlePublicationStep form={form} />
                <button type="button" onClick={() => void group.handleSubmit()}>
                  Create Article
                </button>
              </>
            )}
          </form.FormGroup>
        )
      }
    </form.Subscribe>
  ),
});
```

The group schema receives the value at `name`, not the full form value. Its
field-error paths are relative to that group (`title`, not `content.title`). A
group's `state.meta.isSubmitting` belongs to that step's sync/async validator
and `onGroupSubmit`; root form submission state belongs to the final command.
This separation lets a step perform server-backed validation before advancing
without pretending the entire workflow was submitted.

When the active group name changes by step, prefer an explicit branch with a
literal `name` for each `FormGroup`. Building a heterogeneous
`{ name, validators }` union and spreading it into one component weakens generic
inference and can make a validator for one group appear assignable to another.

All values remain in the root form while steps mount and unmount. Read values
needed by a later step through a narrow `form.Subscribe` selector or the form
API; do not duplicate them in React state. Back navigation only changes the
workflow field. Final submission still validates the complete root schema.

The form model may be shaped for the workflow rather than copied from a
generated request DTO. Map it once at the mutation boundary:

```ts
function mapArticleFormToCreateDto(values: ArticleFormValues): CreateArticleDto {
  return {
    title: values.content.title,
    body: values.content.body,
    status: values.publication.status,
  };
}
```

This preserves nested UI ownership without leaking form structure into the API
contract.

## Available Field Types

The canonical form system registers:

- `FormInput` - standard text input
- `FormTextarea` - multi-line text input with native Enter behavior
- `FormSelect` - dropdown selection with value/error plumbing

Add other adapters with `FieldHOC` when the project needs them. Common
extensions include:

- `Multiselect` - Multiple selection
- `DateInput` - Date picker
- `Checkbox` - Checkbox input
- `InputChip` - Chip-based input

## Best Practices

1. **Define validation schemas** using Zod for type safety and clear runtime rules
2. **Use form hooks** to encapsulate form logic and side effects
3. **Create form components** with `withForm` for reusable form UI
4. **Handle submission** properly with success and error feedback
5. **Use field traits** like `traitEmptyAsNull` when appropriate
6. **Provide meaningful error messages** in validation schemas
7. **Format values** appropriately in field HOCs
8. **Create custom fields** when needed using `FieldHOC`
9. **Reuse one form context pair** across `createFormHook` and all registered fields
10. **Keep domain rules out of `FieldHOC`**; it adapts UI events and accessibility, not business validation
11. **Disable Enter-submit for multiline controls** so generic field plumbing does not override native editing behavior
12. **Share one root form across all steps** and address nested values with typed dot paths
13. **Use `FormGroup` for step-local validation and submission** before advancing the workflow
14. **Branch on literal group names** instead of combining incompatible group validators into a heterogeneous union
15. **Map form values to transport DTOs once** when workflow shape and API shape differ

Submission failures belong to the mutation state. Validation failures belong to
TanStack Form field/form meta. Do not mirror either into an extra React state:
parallel states drift and create contradictory UI. Disable submit from
`form.Subscribe` using `canSubmit` and `isSubmitting`, and render mutation errors
from the mutation object.

## Component Hierarchy

```
Form Component (withForm)
└── form.AppForm
    └── form.FormGroup (active step)
        ├── Step Component (withForm, same root form)
        │   └── form.AppField
        │       └── Field Component (FieldHOC)
        │           └── UI Component (Input, Textarea, etc.)
        └── Step Button → group.handleSubmit()
```

# Forms approach

This document describes the standardized approach to implementing forms in this frontend application.

## Overview

The forms approach uses TanStack Form with Zod validation. Start with TanStack
Form directly, as the canonical Article editor does. Introduce the custom form
hook, `withForm`, field contexts, and `FieldHOC` patterns below when multiple
forms share field behavior; do not build an abstraction for a single field.

## Core Patterns

### 1. Custom Form Hook

Forms are created using a custom `useForm` hook that extends TanStack Form:

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

## Validation Patterns

### Schema validation with Zod

Keep the Zod schema at the entity boundary when it describes an entity command.
Infer the form value type from the schema so runtime and compile-time contracts
cannot drift:

```ts
import { z } from "zod";

export const articleFormSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(20),
  status: z.enum(["draft", "published"]),
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

## Available Field Types

The form system provides several built-in field types:

- `Input` - Standard text input
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
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

Submission failures belong to the mutation state. Validation failures belong to
TanStack Form field/form meta. Do not mirror either into an extra React state:
parallel states drift and create contradictory UI. Disable submit from
`form.Subscribe` using `canSubmit` and `isSubmitting`, and render mutation errors
from the mutation object.

## Component Hierarchy

```
Form Component (withForm)
└── form.AppForm
    ├── form.AppField
    │   └── Field Component (FieldHOC)
    │       └── UI Component (Input, Textarea, etc.)
    └── Submit Button
        └── form.SubmitButton
```

# Lists approach

This document describes the standardized approach to implementing lists in this frontend application.

## Overview

The lists approach uses TanStack Query for data fetching, skeleton loading states for better UX, and integrated filtering through forms that bind to URL query parameters. Lists follow consistent patterns for handling loading, error, and empty states.

## Core Patterns

### 1. Query-Based Data Fetching

Lists use TanStack Query for data fetching with standardized error and loading handling:

```ts
// Basic list component
export function ApiKeysList({ tenantId }: { tenantId: string }) {
  const { data: apiKeys, isLoading, isError } = useQuery(apiKeysQueries.list({ tenantId }));

  if (isLoading) return <ApiKeySkeletonTable />;

  if (isError) return <ErrorState title="Ошибка загрузки ключей" />;

  if (!apiKeys || !apiKeys.length) return <EmptyState title="Ключи не найдены" />;

  return <ApiKeyTable keys={apiKeys} />;
}
```

### 2. Infinite Scrolling Lists

For large datasets, infinite scrolling is implemented:

```ts
function List({ service, filters }: ListProps) {
  const query = useInfiniteQuery(articleQueries.infiniteList(service, filters));
  const articles = query.data?.pages.flatMap((page) => page.items) ?? [];

  if (query.isPending) return <ArticleSkeletonTable />;

  if (query.isError) return <ErrorState title="Could not load Articles" />;

  if (articles.length === 0) return <EmptyState title="No Articles found" />;

  return (
    <>
      <ArticleTable articles={articles} />
      {query.hasNextPage ? (
        <Button
          loading={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          Load more
        </Button>
      ) : null}
    </>
  );
}
```

### 3. Skeleton Loading States

Skeleton tables provide loading states that match the actual table structure:

```ts
const ArticleSkeletonTable = createSkeletonTable(ArticleTable, 10);

// In component
if (isLoading) return <ArticleSkeletonTable />;
```

### 4. Filter Integration

Lists often include filter forms that bind to URL query parameters:

```ts
export function ArticleList({ tenantId }: { tenantId?: string }) {
  const form = useArticleListFilters(tenantId ? [tenantId] : null);

  return (
    <>
      <ArticleListFilters form={form} withTenants={!tenantId} />
      <form.Subscribe selector={(form) => omitNullValues(form.values)}>
        {(values) => <List filters={values} />}
      </form.Subscribe>
    </>
  );
}
```

## Filter Patterns

### Query-Bounded Forms

Filter forms are bound to URL query parameters using a custom hook:

```ts
export function useArticleListFilters(tenantIds: string[] | null = null) {
  return useQueryBoundedForm(
    {
      ...formOpts,
      defaultValues: {
        ...formOpts.defaultValues,
        tenantIds,
      },
    },
    {
      filter: tenantIds
        ? ({ formApi }) => {
            // do not set tenantIds to query params if it is pre-setted
            const { tenantIds, ...rest } = formApi.state.values;
            return rest;
          }
        : undefined,
    },
  );
}
```

### Form Integration

Filter forms use the standard form system:

```ts
export const ArticleListFilters = withForm({
  ...formOpts,
  props: {
    withTenants: true,
  } as { withTenants?: boolean },
  render: function CreateTenantForm({ form, withTenants }) {
    // Form implementation
  },
});
```

## State Handling Patterns

### Loading States

All lists handle loading states with skeleton screens:

```ts
const ApiKeySkeletonTable = createSkeletonTable(ApiKeyTable, 10);

// In component
if (isLoading) return <ApiKeySkeletonTable />;
```

### Error States

Consistent error handling with error state components:

```ts
if (isError) return <ErrorState title="Ошибка загрузки ключей" />;
```

### Empty States

Standardized empty state handling:

```ts
if (!apiKeys || !apiKeys.length) return <EmptyState title="Ключи не найдены" />;
```

## Usage Patterns

### Creating a Basic List

```ts
export function BasicList({ tenantId }: { tenantId: string }) {
  const { data, isLoading, isError } = useQuery(itemsQueries.list({ tenantId }));

  if (isLoading) return <ItemSkeletonTable />;

  if (isError) return <ErrorState title="Ошибка загрузки элементов" />;

  if (!data || !data.length) return <EmptyState title="Элементы не найдены" />;

  return <ItemTable items={data} />;
}
```

### Creating a Filtered List

```ts
export function FilteredList({ categoryId }: { categoryId?: string }) {
  const form = useFilterForm(categoryId ? [categoryId] : null);

  return (
    <>
      <FilterForm form={form} withCategories={!categoryId} />
      <form.Subscribe selector={(form) => omitNullValues(form.values)}>
        {(values) => <List filters={values} />}
      </form.Subscribe>
    </>
  );
}
```

### Creating Skeleton Tables

```ts
const ItemSkeletonTable = createSkeletonTable(ItemTable, 10);
```

## Advanced Patterns

### Query Parameter Binding

Filters belong in TanStack Router search params so they are typed, shareable,
restorable, and available to route loaders. A reusable form adapter may sync
form values to typed navigation:

```ts
export function useQueryBoundedForm(options, { filter }) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return useForm({
    defaultValues: deepMerge(defaultValues, omitNullValues(search)),
    listeners: {
      onChange: (form) => {
        const values = filter ? filter(form) : form.formApi.state.values;
        void navigate({ search: values, replace: true });
      },
    },
    ...options,
  });
}
```

### Conditional Filtering

Filters can be conditionally applied:

```ts
const filter = tenantIds
  ? ({ formApi }) => {
      // do not set tenantIds to query params if it is pre-set
      const { tenantIds, ...rest } = formApi.state.values;
      return rest;
    }
  : undefined;
```

## Best Practices

1. **Always handle all states** - loading, error, and empty states
2. **Use skeleton tables** for consistent loading experiences
3. **Bind filters to query params** for shareable URLs
4. **Implement proper error handling** with user-friendly messages
5. **Use infinite scrolling** for large datasets
6. **Provide meaningful empty states** with clear messaging
7. **Filter null values** from query parameters
8. **Conditionally apply filters** when needed

Infinite-query cache values are `InfiniteData`, not flat arrays. Code that
searches or updates cached list entries must iterate `pages[].items` and account
for multiple simultaneous filter keys. See
[server-state-cache.md](./server-state-cache.md).

## Component Hierarchy

```
List Component
├── Filter Form (optional)
│   ├── Form Component (withForm)
│   └── Filter Fields
├── Data Fetching
│   ├── useQuery / useInfiniteQuery
│   └── Query Hooks
└── Display
    ├── Loading State (SkeletonTable)
    ├── Error State (ErrorState)
    ├── Empty State (EmptyState)
    └── Data Table (Table Component)
```

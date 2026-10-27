# Lists

Treat initial loading, empty, ready, background refresh and pagination failure as distinct states. Keep previously rendered pages visible while fetching the next page.

For infinite queries:

- keep filter and sort parameters in the query key;
- use the API's cursor/page metadata for `getNextPageParam`;
- flatten pages only at the rendering boundary;
- render stable item keys from identifiers;
- expose retry where the failure occurred;
- avoid copying the flattened list into component state.

Use list summaries as previews only. Detail-only fields need their own skeleton until the detail query resolves.

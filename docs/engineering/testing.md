# Testing

Test behavior at the narrowest boundary that proves it.

- Unit-test keys, mappers, schemas, preview lookup and cache helpers with a real isolated QueryClient.
- Integration-test API/query behavior with MSW in Node; never call a real backend.
- Component-test discriminated UI states rather than mocking internal query flags.
- Test modal factories with a minimal adapter: params survive `close`, reset on `onCloseEnd`, and parameterless `open` needs no placeholder argument.
- Render at least one registered field through `useAppForm`; this catches mismatched `createFormHookContexts()` instances that type checking cannot detect.
- Exercise a nested dot-path field through a registered adapter and unit-test the form-to-command mapper when the nested form shape differs from the API DTO.
- Storybook stories cover visual states and accessibility, not business logic already proven in unit tests.
- Regenerate API and mock artifacts in CI and fail on drift.

Every QueryClient test creates and clears its own client with retries disabled. Deterministic mock scenarios include success, empty list and server error.

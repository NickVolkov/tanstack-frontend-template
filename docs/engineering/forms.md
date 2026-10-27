# Forms

Use TanStack Form for draft state and Zod for domain-independent validation at input boundaries.

- Keep initial values explicit and serializable.
- Put field validation beside the field schema; put cross-field validation at form level.
- Convert form values into API commands in the feature model, not inside presentational fields.
- Disable duplicate submission and keep server errors visible without erasing the draft.
- Reset only after a confirmed success or an explicit cancel.

The Article editor demonstrates create/update orchestration without teaching entity UI about cache invalidation.

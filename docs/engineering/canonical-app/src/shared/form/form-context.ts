import { createFormHookContexts } from "@tanstack/react-form";

/** A single context pair shared by createFormHook and every registered field. */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

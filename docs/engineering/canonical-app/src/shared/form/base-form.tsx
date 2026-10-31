import { Button } from "@mantine/core";
import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "./form-context";
import { FormInput, FormTextarea } from "./input";

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { FormInput, FormTextarea },
  formComponents: { Button },
  fieldContext,
  formContext,
});

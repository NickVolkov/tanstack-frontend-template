import { Textarea, TextInput } from "@mantine/core";

import { FieldHOC } from "./field-hoc";

export const FormInput = FieldHOC(TextInput, {
  extractValue: (event) => event.currentTarget.value,
});

export const FormTextarea = FieldHOC(Textarea, {
  extractValue: (event) => event.currentTarget.value,
  submitOnEnter: false,
});

import { Select } from "@mantine/core";

import { FieldHOC } from "./field-hoc";

export const FormSelect = FieldHOC(Select, {
  extractValue: (value) => value,
  submitOnEnter: false,
});

import { type ComponentType, type KeyboardEvent, type ReactNode, useCallback } from "react";

import { useFieldContext } from "./form-context";

// UI libraries expose callbacks with heterogeneous argument lists.
// oxlint-disable-next-line typescript/no-explicit-any
type Callback = ((...args: any[]) => void) | null;

type FieldControlProps = {
  // oxlint-disable-next-line typescript/no-explicit-any
  value?: any;
  onChange?: Callback;
  onBlur?: Callback;
  onKeyDown?: Callback;
  name?: string;
};

function isKeyboardEvent(event: unknown): event is KeyboardEvent {
  return Boolean(event && typeof event === "object" && event !== null && "key" in event);
}

export function FieldHOC<Props extends FieldControlProps, Value = Props["value"]>(
  WrappedComponent: ComponentType<Props>,
  {
    extractValue,
    formatValue = (value) => value,
    isEmpty = (value) => !value,
    submitOnEnter = true,
  }: {
    formatValue?: (value: Value) => Props["value"];
    extractValue: (
      // oxlint-disable-next-line typescript/no-explicit-any
      ...args: Parameters<Extract<Props["onChange"], (...args: any[]) => void>>
    ) => Value;
    isEmpty?: (value: Value) => boolean;
    submitOnEnter?: boolean;
  },
) {
  function InnerField({
    traitEmptyAsNull,
    showError,
    ...props
  }: Omit<Props, keyof FieldControlProps> & {
    outerLabel?: ReactNode;
    traitEmptyAsNull?: boolean;
    showError?: boolean;
  }) {
    const field = useFieldContext<Value>();

    const handleChange = useCallback(
      (
        // oxlint-disable-next-line typescript/no-explicit-any
        ...args: Parameters<Extract<Props["onChange"], (...args: any[]) => void>>
      ) => {
        const value = extractValue(...args);
        field.handleChange(
          traitEmptyAsNull && isEmpty(value)
            ? // An empty UI value intentionally maps to the field's nullable value.
              // oxlint-disable-next-line typescript/no-unsafe-type-assertion
              (null as Value)
            : value,
        );
      },
      [field, traitEmptyAsNull],
    );

    const handleKeyDown = useCallback(
      (event: unknown) => {
        if (submitOnEnter && isKeyboardEvent(event) && event.key === "Enter") {
          void field.form.handleSubmit();
        }
      },
      [field],
    );
    const isError = !field.state.meta.isValid;
    const firstError = field.state.meta.errors[0];

    return (
      <WrappedComponent
        // Field plumbing is removed from the caller-facing props above.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        {...(props as Props)}
        error={isError && showError !== false ? String(firstError ?? "Invalid value") : undefined}
        aria-invalid={isError}
        name={field.name}
        onKeyDown={handleKeyDown}
        value={formatValue(field.state.value)}
        onChange={handleChange}
        onBlur={field.handleBlur}
      />
    );
  }

  InnerField.displayName = `field_${WrappedComponent.displayName || WrappedComponent.name}`;
  return InnerField;
}

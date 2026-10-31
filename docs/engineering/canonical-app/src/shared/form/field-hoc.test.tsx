import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAppForm } from "./base-form";

afterEach(cleanup);

function FormFixture({ onSubmit }: { onSubmit: () => void }) {
  const form = useAppForm({
    defaultValues: { title: "", body: "" },
    onSubmit,
  });

  return (
    <MantineProvider>
      <form.AppField name="title">{(field) => <field.FormInput label="Title" />}</form.AppField>
      <form.AppField name="body">{(field) => <field.FormTextarea label="Body" />}</form.AppField>
    </MantineProvider>
  );
}

describe("FieldHOC", () => {
  it("submits a text input on Enter", async () => {
    const onSubmit = vi.fn();
    render(<FormFixture onSubmit={onSubmit} />);

    fireEvent.keyDown(screen.getByLabelText("Title"), { key: "Enter" });

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });

  it("preserves Enter for multiline input", () => {
    const onSubmit = vi.fn();
    render(<FormFixture onSubmit={onSubmit} />);

    fireEvent.keyDown(screen.getByLabelText("Body"), { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

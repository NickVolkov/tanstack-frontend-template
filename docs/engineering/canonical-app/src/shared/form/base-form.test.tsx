import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useAppForm } from "./base-form";

function FormFixture() {
  const form = useAppForm({ defaultValues: { name: "Ada" } });

  return <form.AppField name="name">{(field) => <field.FormInput label="Name" />}</form.AppField>;
}

describe("application form", () => {
  it("connects registered fields to the shared field context", () => {
    const html = renderToStaticMarkup(
      <MantineProvider>
        <FormFixture />
      </MantineProvider>,
    );

    expect(html).toContain('name="name"');
    expect(html).toContain('value="Ada"');
  });
});

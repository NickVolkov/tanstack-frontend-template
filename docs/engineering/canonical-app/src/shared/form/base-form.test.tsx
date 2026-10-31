import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useAppForm } from "./base-form";

function FormFixture() {
  const form = useAppForm({
    defaultValues: {
      author: { name: "Ada" },
      publication: { status: "draft" },
    },
  });

  return (
    <>
      <form.AppField name="author.name">
        {(field) => <field.FormInput label="Name" />}
      </form.AppField>
      <form.AppField name="publication.status">
        {(field) => <field.FormSelect label="Status" data={["draft", "published"]} />}
      </form.AppField>
    </>
  );
}

describe("application form", () => {
  it("connects registered fields to the shared field context", () => {
    const html = renderToStaticMarkup(
      <MantineProvider>
        <FormFixture />
      </MantineProvider>,
    );

    expect(html).toContain('name="author.name"');
    expect(html).toContain('value="Ada"');
    expect(html).toContain('name="publication.status"');
    expect(html).toContain('value="draft"');
  });
});

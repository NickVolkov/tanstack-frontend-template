import { Alert, Button, Group, Select, Stack } from "@mantine/core";
import { formOptions } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { articleFormSchema, articleMutations, type ArticleFormValues } from "@/entities/article";
import { createContextModal, MantineContextModal, useAppForm, withForm } from "@/shared";

const { useModal, withModal } = createContextModal({
  name: "ArticleEditor",
  ModalComponent: MantineContextModal,
});

const initialValues: ArticleFormValues = {
  title: "",
  body: "",
  status: "draft",
};

const articleFormOptions = formOptions({
  defaultValues: initialValues,
  validators: { onSubmit: articleFormSchema },
});

const ArticleEditorForm = withForm({
  ...articleFormOptions,
  props: {
    close: () => {},
    mutationError: null as unknown,
  },
  render: function ArticleEditorForm({ form, close, mutationError }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <Stack>
          {mutationError ? <Alert color="red">The Article could not be created.</Alert> : null}

          <form.AppField name="title">{(field) => <field.FormInput label="Title" />}</form.AppField>
          <form.AppField name="body">
            {(field) => <field.FormTextarea label="Body" minRows={7} />}
          </form.AppField>
          <form.AppField name="status">
            {(field) => (
              <Select
                label="Status"
                data={["draft", "published"]}
                value={field.state.value}
                onChange={(value) =>
                  field.handleChange(value === "published" ? "published" : "draft")
                }
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.AppField>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close} type="button">
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
                  Create Article
                </Button>
              )}
            </form.Subscribe>
          </Group>
        </Stack>
      </form>
    );
  },
});

function ArticleEditorModalRoot() {
  const { close } = useModal();
  const queryClient = useQueryClient();
  const { ArticlesService } = useRouter().options.context.api;
  const createArticle = useMutation(articleMutations.create(ArticlesService, queryClient));
  const form = useAppForm({
    ...articleFormOptions,
    onSubmit: async ({ value }) => {
      await createArticle.mutateAsync(value);
      close();
    },
  });

  return <ArticleEditorForm form={form} close={close} mutationError={createArticle.error} />;
}

export { useModal as useArticleEditorModal };
export const withArticleEditorModal = withModal(ArticleEditorModalRoot, {
  title: "New Article",
  size: "lg",
});

import { Alert, Button, Group, Stack } from "@mantine/core";
import { formOptions } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import {
  articleFormSchema,
  articleMutations,
  mapArticleFormToCreateDto,
  type ArticleFormValues,
} from "@/entities/article";
import { createContextModal, MantineContextModal, useAppForm, withForm } from "@/shared";

const { useModal, withModal } = createContextModal({
  name: "ArticleEditor",
  ModalComponent: MantineContextModal,
});

const initialValues: ArticleFormValues = {
  title: "",
  body: "",
  publication: { status: "draft" },
};

const articleFormOptions = formOptions({
  defaultValues: initialValues,
  validators: { onSubmit: articleFormSchema },
});

const ArticlePublicationFields = withForm({
  ...articleFormOptions,
  render: function ArticlePublicationFields({ form }) {
    return (
      <form.AppField name="publication.status">
        {(field) => <field.FormSelect label="Status" data={["draft", "published"]} />}
      </form.AppField>
    );
  },
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
          <ArticlePublicationFields form={form} />
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
      await createArticle.mutateAsync(mapArticleFormToCreateDto(value));
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

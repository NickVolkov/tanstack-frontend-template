import { Alert, Button, Group, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { articleFormSchema, articleMutations, type ArticleFormValues } from "@/entities/article";
import { createContextModal, MantineContextModal } from "@/shared";

const { useModal, withModal } = createContextModal({
  name: "ArticleEditor",
  ModalComponent: MantineContextModal,
});

const initialValues: ArticleFormValues = { title: "", body: "", status: "draft" };

function ArticleEditorForm({ close }: { close: () => void }) {
  const queryClient = useQueryClient();
  const { ArticlesService } = useRouter().options.context.api;
  const createArticle = useMutation(articleMutations.create(ArticlesService, queryClient));
  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: articleFormSchema },
    onSubmit: async ({ value }) => {
      await createArticle.mutateAsync(value);
      close();
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Stack>
        {createArticle.error ? <Alert color="red">The Article could not be created.</Alert> : null}

        <form.Field name="title">
          {(field) => (
            <TextInput
              label="Title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.currentTarget.value)}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <form.Field name="body">
          {(field) => (
            <Textarea
              label="Body"
              minRows={7}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.currentTarget.value)}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <form.Field name="status">
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
        </form.Field>
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
}

function ArticleEditorModalRoot() {
  const { close } = useModal();
  return <ArticleEditorForm close={close} />;
}

export { useModal as useArticleEditorModal };
export const withArticleEditorModal = withModal(ArticleEditorModalRoot, {
  title: "New Article",
  size: "lg",
});

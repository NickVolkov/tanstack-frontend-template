import { Alert, Button, Group, Modal, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { articleFormSchema, articleMutations, type ArticleFormValues } from "@/entities/article";
import { createModalController } from "@/shared";

const articleEditorModal = createModalController<undefined>("ArticleEditor");
const initialValues: ArticleFormValues = {
  title: "",
  body: "",
  status: "draft",
};

function ArticleEditorForm({ close }: { close: () => void }) {
  const queryClient = useQueryClient();
  const { ArticlesService } = useRouter().options.context.api;
  const createArticle = useMutation(articleMutations.create(ArticlesService, queryClient));
  const [validationError, setValidationError] = useState<string>();
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      const parsed = articleFormSchema.safeParse(value);
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0]?.message ?? "Check the form");
        return;
      }
      await createArticle.mutateAsync(parsed.data);
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
        {validationError ? <Alert color="red">{validationError}</Alert> : null}
        {createArticle.error ? <Alert color="red">The Article could not be created.</Alert> : null}

        <form.Field name="title">
          {(field) => (
            <TextInput
              label="Title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.currentTarget.value)}
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
            />
          )}
        </form.Field>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={close} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={createArticle.isPending}>
            Create Article
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function ArticleEditorModal() {
  const modal = articleEditorModal.useModal();
  return (
    <Modal opened={modal.isOpen} onClose={modal.close} title="New Article" size="lg">
      <ArticleEditorForm close={modal.close} />
    </Modal>
  );
}

export const ArticleEditorModalProvider = articleEditorModal.Provider;
export const useArticleEditorModal = articleEditorModal.useModal;

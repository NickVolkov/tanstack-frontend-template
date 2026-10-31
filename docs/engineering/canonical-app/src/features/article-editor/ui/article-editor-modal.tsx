import { Alert, Button, Group, Stack, Text, Title } from "@mantine/core";
import { formOptions } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import {
  articleContentSchema,
  articleFormSchema,
  articleMutations,
  articlePublicationSchema,
  mapArticleFormToCreateDto,
  type ArticleFormValues,
} from "@/entities/article";
import { createContextModal, MantineContextModal, useAppForm, withForm } from "@/shared";

const { useModal, withModal } = createContextModal({
  name: "ArticleEditor",
  ModalComponent: MantineContextModal,
});

const initialValues: ArticleFormValues = {
  currentStep: 1,
  content: { title: "", body: "" },
  publication: { status: "draft" },
};

const articleFormOptions = formOptions({
  defaultValues: initialValues,
  validators: { onSubmit: articleFormSchema },
});

const ArticleContentStep = withForm({
  ...articleFormOptions,
  render: function ArticleContentStep({ form }) {
    return (
      <Stack>
        <form.AppField name="content.title">
          {(field) => <field.FormInput label="Title" />}
        </form.AppField>
        <form.AppField name="content.body">
          {(field) => <field.FormTextarea label="Body" minRows={7} />}
        </form.AppField>
      </Stack>
    );
  },
});

const ArticlePublicationStep = withForm({
  ...articleFormOptions,
  render: function ArticlePublicationStep({ form }) {
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
        }}
      >
        <Stack>
          {mutationError ? <Alert color="red">The Article could not be created.</Alert> : null}
          <form.Subscribe selector={(state) => state.values.currentStep}>
            {(step) =>
              step === 1 ? (
                <form.FormGroup
                  name="content"
                  validators={{ onSubmit: articleContentSchema }}
                  onGroupSubmit={() => form.setFieldValue("currentStep", 2)}
                >
                  {(group) => (
                    <Stack>
                      <StepHeading step={1} title="Write the Article" />
                      <ArticleContentStep form={form} />
                      <Group justify="space-between">
                        <Button variant="subtle" onClick={close} type="button">
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          loading={group.state.meta.isSubmitting}
                          onClick={() => void group.handleSubmit()}
                        >
                          Continue
                        </Button>
                      </Group>
                    </Stack>
                  )}
                </form.FormGroup>
              ) : (
                <form.FormGroup
                  name="publication"
                  validators={{ onSubmit: articlePublicationSchema }}
                  onGroupSubmit={() => form.handleSubmit()}
                >
                  {(group) => (
                    <Stack>
                      <StepHeading step={2} title="Choose publication status" />
                      <ArticlePublicationStep form={form} />
                      <Group justify="space-between">
                        <Button
                          variant="subtle"
                          onClick={() => form.setFieldValue("currentStep", 1)}
                          type="button"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          loading={group.state.meta.isSubmitting}
                          onClick={() => void group.handleSubmit()}
                        >
                          Create Article
                        </Button>
                      </Group>
                    </Stack>
                  )}
                </form.FormGroup>
              )
            }
          </form.Subscribe>
        </Stack>
      </form>
    );
  },
});

function StepHeading({ step, title }: { step: 1 | 2; title: string }) {
  return (
    <div>
      <Text c="dimmed" size="sm">
        Step {step} of 2
      </Text>
      <Title order={3}>{title}</Title>
    </div>
  );
}

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

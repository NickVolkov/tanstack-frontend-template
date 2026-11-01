import { Alert, Button, Group, Stack, Text, Title } from "@mantine/core";

import { withForm } from "@/shared/form";
import { createContextModal, MantineContextModal } from "@/shared/modal";

import {
  articleEditorContentSchema,
  articleEditorFormOptions,
  articleEditorPublicationSchema,
} from "../model/article-editor.form";
import { useArticleEditorForm } from "../model/use-article-editor-form";

const { useModal, withModal } = createContextModal({
  name: "ArticleEditor",
  ModalComponent: MantineContextModal,
});

const StepOne = withForm({
  ...articleEditorFormOptions,
  props: { close: () => {} },
  render: function StepOne({ form, close }) {
    return (
      <form.FormGroup
        name="content"
        validators={{ onSubmit: articleEditorContentSchema }}
        onGroupSubmit={() => form.setFieldValue("currentStep", 2)}
      >
        {(group) => (
          <Stack>
            <StepHeading step={1} title="Write the Article" />
            <form.AppField name="content.title">
              {(field) => <field.FormInput label="Title" />}
            </form.AppField>
            <form.AppField name="content.body">
              {(field) => <field.FormTextarea label="Body" minRows={7} />}
            </form.AppField>
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
    );
  },
});

const StepTwo = withForm({
  ...articleEditorFormOptions,
  render: function StepTwo({ form }) {
    return (
      <form.FormGroup
        name="publication"
        validators={{ onSubmit: articleEditorPublicationSchema }}
        onGroupSubmit={() => form.handleSubmit()}
      >
        {(group) => (
          <Stack>
            <StepHeading step={2} title="Choose publication status" />
            <form.AppField name="publication.status">
              {(field) => <field.FormSelect label="Status" data={["draft", "published"]} />}
            </form.AppField>
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
    );
  },
});

const ArticleEditorForm = withForm({
  ...articleEditorFormOptions,
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
            {(step) => {
              switch (step) {
                case 1:
                  return <StepOne form={form} close={close} />;
                case 2:
                  return <StepTwo form={form} />;
              }

              return null;
            }}
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
  const { form, mutationError } = useArticleEditorForm({ onCreated: close });

  return <ArticleEditorForm form={form} close={close} mutationError={mutationError} />;
}

export { useModal as useArticleEditorModal };
export const withArticleEditorModal = withModal(ArticleEditorModalRoot, {
  title: "New Article",
  size: "lg",
});

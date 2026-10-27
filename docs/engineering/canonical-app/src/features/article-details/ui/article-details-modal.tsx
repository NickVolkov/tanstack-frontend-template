import { Alert, Badge, Button, Group, Modal, Skeleton, Stack, Text, Title } from "@mantine/core";

import { createModalController } from "@/shared";

import { useArticleDetails } from "../model/use-article-details";

const articleDetailsModal = createModalController<{ articleId: string }>("ArticleDetails");

function ArticleDetailsContent({ articleId }: { articleId: string }) {
  const query = useArticleDetails(articleId);
  const preview = query.data.status === "ready" ? query.data.details : query.data.preview;

  return (
    <Stack gap="lg">
      {preview ? (
        <Stack gap={6}>
          <Group justify="space-between">
            <Badge variant="light">{preview.status}</Badge>
            <Text size="sm" c="dimmed">
              {new Date(preview.updatedAt).toLocaleDateString()}
            </Text>
          </Group>
          <Title order={2}>{preview.title}</Title>
          <Text c="dimmed">{preview.excerpt}</Text>
        </Stack>
      ) : null}

      {query.data.status === "loading" ? (
        <Stack aria-label="Loading full Article">
          <Skeleton height={18} width="35%" />
          <Skeleton height={14} />
          <Skeleton height={14} />
          <Skeleton height={14} width="75%" />
        </Stack>
      ) : null}

      {query.data.status === "ready" ? (
        <Stack>
          <Text className="article-body">{query.data.details.body}</Text>
          <Text size="sm" c="dimmed">
            By {query.data.details.authorName}
          </Text>
        </Stack>
      ) : null}

      {query.data.status === "error" ? (
        <Alert color="red" title="Could not load the full Article">
          <Stack gap="sm">
            <Text size="sm">The preview remains available while you retry.</Text>
            <Button variant="light" onClick={() => query.refetch()}>
              Retry
            </Button>
          </Stack>
        </Alert>
      ) : null}
    </Stack>
  );
}

export function ArticleDetailsModal() {
  const modal = articleDetailsModal.useModal();
  return (
    <Modal opened={modal.isOpen} onClose={modal.close} title="Article details" size="lg">
      {modal.params ? <ArticleDetailsContent articleId={modal.params.articleId} /> : null}
    </Modal>
  );
}

export const ArticleDetailsModalProvider = articleDetailsModal.Provider;
export const useArticleDetailsModal = articleDetailsModal.useModal;

import { Alert, Badge, Button, Group, Skeleton, Stack, Text, Title } from "@mantine/core";

import { createContextModal, MantineContextModal } from "@/shared";

import { useArticleDetails } from "../model/use-article-details";

type ArticleDetailsModalParams = { articleId: string | null };

const { useModal, withModal } = createContextModal({
  name: "ArticleDetails",
  ModalComponent: MantineContextModal,
  getInitialParams: (): ArticleDetailsModalParams => ({ articleId: null }),
});

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

function ArticleDetailsModalRoot() {
  const { params } = useModal();
  if (!params.articleId) return null;
  return <ArticleDetailsContent articleId={params.articleId} />;
}

export { useModal as useArticleDetailsModal };
export const withArticleDetailsModal = withModal(ArticleDetailsModalRoot, {
  title: "Article details",
  size: "lg",
});
export type { ArticleDetailsModalParams };

import { Alert, Button, Container, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { ArticleCard, articleQueries } from "@/entities/article";
import {
  ArticleDetailsModal,
  ArticleDetailsModalProvider,
  useArticleDetailsModal,
} from "@/features/article-details";
import {
  ArticleEditorModal,
  ArticleEditorModalProvider,
  useArticleEditorModal,
} from "@/features/article-editor";

function ArticlesScreen() {
  const { ArticlesService } = useRouter().options.context.api;
  const articles = useInfiniteQuery(articleQueries.infiniteList(ArticlesService, { limit: 6 }));
  const detailsModal = useArticleDetailsModal();
  const editorModal = useArticleEditorModal();
  const items = articles.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="articles-shell">
      <Container size="lg" py={{ base: 40, md: 72 }}>
        <Stack gap={40}>
          <Group justify="space-between" align="flex-end">
            <div>
              <Text className="eyebrow">Canonical vertical slice</Text>
              <Title order={1} className="page-title">
                The Article ledger
              </Title>
            </div>
            <Button onClick={() => editorModal.open(undefined)}>New Article</Button>
          </Group>

          {articles.isPending ? (
            <Group justify="center" py={80} aria-label="Loading Articles">
              <Loader />
            </Group>
          ) : null}

          {articles.isError ? (
            <Alert color="red" title="Could not load Articles">
              <Button variant="light" mt="sm" onClick={() => articles.refetch()}>
                Retry
              </Button>
            </Alert>
          ) : null}

          {!articles.isPending && !articles.isError && items.length === 0 ? (
            <section className="empty-state">
              <Title order={2}>No Articles match this view</Title>
              <Text c="dimmed">Create one or change the mock scenario.</Text>
            </section>
          ) : null}

          {items.length > 0 ? (
            <section className="article-grid" aria-label="Articles">
              {items.map((article) => (
                <ArticleCard
                  article={article}
                  key={article.id}
                  onOpen={(articleId) => detailsModal.open({ articleId })}
                />
              ))}
            </section>
          ) : null}

          {articles.hasNextPage ? (
            <Button
              variant="outline"
              loading={articles.isFetchingNextPage}
              onClick={() => articles.fetchNextPage()}
            >
              Load more
            </Button>
          ) : null}
        </Stack>
      </Container>
      <ArticleDetailsModal />
      <ArticleEditorModal />
    </main>
  );
}

export function ArticlesPage() {
  return (
    <ArticleDetailsModalProvider>
      <ArticleEditorModalProvider>
        <ArticlesScreen />
      </ArticleEditorModalProvider>
    </ArticleDetailsModalProvider>
  );
}

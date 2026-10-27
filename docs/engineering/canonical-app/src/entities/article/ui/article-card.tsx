import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";

import type { ArticleListItemDto } from "@/api/generated/types.gen";

export function ArticleCard({
  article,
  onOpen,
}: {
  article: ArticleListItemDto;
  onOpen: (articleId: string) => void;
}) {
  return (
    <Paper component="article" className="article-card" radius={0} p="xl">
      <Stack h="100%" justify="space-between">
        <Stack>
          <Group justify="space-between">
            <Badge color={article.status === "published" ? "teal" : "gray"}>{article.status}</Badge>
            <Text size="xs" c="dimmed">
              {new Date(article.updatedAt).toLocaleDateString()}
            </Text>
          </Group>
          <Title order={2}>{article.title}</Title>
          <Text c="dimmed">{article.excerpt}</Text>
        </Stack>
        <Button variant="transparent" px={0} onClick={() => onOpen(article.id)}>
          Read full Article →
        </Button>
      </Stack>
    </Paper>
  );
}

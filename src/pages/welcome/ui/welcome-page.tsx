import { Anchor, Badge, Box, Container, Group, Stack, Text, Title } from "@mantine/core";

const foundations = [
  ["FSD boundaries", "Features depend inward through public APIs."],
  ["Server state", "Query keys encode source, parameters, and projection."],
  ["Executable guidance", "The Article reference app keeps examples honest."],
] as const;

export function WelcomePage() {
  return (
    <main className="welcome-shell">
      <Container size="lg" py={{ base: 56, sm: 96 }}>
        <Stack gap={48}>
          <Group justify="space-between" align="center">
            <Text className="wordmark">FIELD NOTES / 01</Text>
            <Badge variant="outline" color="dark" radius="xs">
              TanStack baseline
            </Badge>
          </Group>

          <Box maw={780}>
            <Text className="eyebrow">A frontend that explains itself</Text>
            <Title order={1} className="display-title">
              Begin with explicit boundaries, then earn the abstractions.
            </Title>
            <Text className="lede" mt="xl">
              This repository is intentionally small. The reusable engineering rules and their
              executable Article slice live under docs/engineering.
            </Text>
          </Box>

          <section className="foundation-grid" aria-label="Template foundations">
            {foundations.map(([title, body], index) => (
              <article className="foundation-card" key={title}>
                <Text className="card-index">0{index + 1}</Text>
                <Title order={2}>{title}</Title>
                <Text>{body}</Text>
              </article>
            ))}
          </section>

          <Text size="sm" c="dimmed">
            Start with <Anchor href="/docs/engineering/README.md">the engineering index</Anchor>,
            then run the canonical app from its own workspace.
          </Text>
        </Stack>
      </Container>
    </main>
  );
}

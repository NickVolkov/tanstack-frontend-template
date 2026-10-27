import { createFileRoute } from "@tanstack/react-router";

import { ArticlesPage } from "@/pages/articles";

export const Route = createFileRoute("/")({ component: ArticlesPage });

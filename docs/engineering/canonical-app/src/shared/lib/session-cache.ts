import type { QueryClient, QueryKey } from "@tanstack/react-query";

export async function clearPrivateServerState(
  queryClient: QueryClient,
  isPublicQuery: (queryKey: QueryKey) => boolean,
): Promise<void> {
  const isPrivateQuery = (query: { queryKey: QueryKey }) => !isPublicQuery(query.queryKey);

  await queryClient.cancelQueries({ predicate: isPrivateQuery });
  queryClient.removeQueries({ predicate: isPrivateQuery });
}

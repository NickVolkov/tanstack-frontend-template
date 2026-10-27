import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { clearPrivateServerState } from "./session-cache";

describe("clearPrivateServerState", () => {
  it("removes private cache and preserves explicitly public entries", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["public", "catalog"], { version: 1 });
    queryClient.setQueryData(["articles", "detail", "private-id"], { secret: true });

    await clearPrivateServerState(queryClient, (key) => key[0] === "public");

    expect(queryClient.getQueryData(["public", "catalog"])).toEqual({ version: 1 });
    expect(queryClient.getQueryData(["articles", "detail", "private-id"])).toBeUndefined();
  });
});

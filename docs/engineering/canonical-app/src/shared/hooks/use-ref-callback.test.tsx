import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRefCallback } from "./use-ref-callback";

describe("useRefCallback", () => {
  it("keeps identity stable and invokes the latest handler", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ handler }) => useRefCallback(handler), {
      initialProps: { handler: first },
    });
    const stableCallback = result.current;

    rerender({ handler: second });
    void act(() => result.current());

    expect(result.current).toBe(stableCallback);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });
});

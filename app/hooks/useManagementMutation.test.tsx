import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { useManagementMutation } from "~/hooks/useManagementMutation";

describe("useManagementMutation", () => {
  it("成功時にtrueを返し、完了後にlockとpendingを解除する", async () => {
    const operation = vi.fn().mockResolvedValue(undefined);
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useManagementMutation({ onRevalidate })
    );

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.run(operation, "fallback", true);
    });

    expect(succeeded).toBe(true);
    expect(operation).toHaveBeenCalledOnce();
    expect(onRevalidate).toHaveBeenCalledOnce();
    expect(result.current.isMutating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("pending中の二重実行を1回に抑え、失敗後は再実行できる", async () => {
    let resolveOperation!: () => void;
    const operation = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveOperation = resolve;
        })
    );
    const { result } = renderHook(() => useManagementMutation());

    let first: Promise<boolean> | undefined;
    let second: Promise<boolean> | undefined;
    act(() => {
      first = result.current.run(operation, "fallback");
      second = result.current.run(operation, "fallback");
    });

    await expect(second).resolves.toBe(false);
    expect(operation).toHaveBeenCalledOnce();
    expect(result.current.isMutating).toBe(true);

    resolveOperation();
    await act(async () => {
      await first;
    });
    expect(result.current.isMutating).toBe(false);

    operation.mockRejectedValueOnce(new Error("actual failure"));
    await act(async () => {
      await result.current.run(operation, "fallback");
    });
    expect(result.current.error).toBe("fallback");
    expect(result.current.isMutating).toBe(false);

    await act(async () => {
      await result.current.run(
        vi.fn().mockRejectedValue(new ApiClientError(409, "API failure")),
        "fallback"
      );
    });
    expect(result.current.error).toBe("API failure");

    act(() => result.current.clearError());
    await waitFor(() => expect(result.current.error).toBeNull());
  });
});

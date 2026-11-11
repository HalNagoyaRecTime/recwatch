import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { useManagementOptions } from "~/hooks/useManagementOptions";

describe("useManagementOptions", () => {
  it("同じRoute lifecycleの再renderではoption APIを再取得しない", async () => {
    const load = vi.fn().mockResolvedValue([{ id: 1 }]);
    const { result, rerender } = renderHook(() =>
      useManagementOptions(load, "候補を取得できませんでした。")
    );

    await waitFor(() => expect(result.current.items).toEqual([{ id: 1 }]));
    rerender();

    expect(load).toHaveBeenCalledOnce();
    expect(result.current.isLoading).toBe(false);
  });

  it("option APIの失敗を一覧loaderへthrowせずstateへ分離する", async () => {
    const load = vi
      .fn()
      .mockRejectedValue(new ApiClientError(503, "候補APIエラー"));
    const { result } = renderHook(() =>
      useManagementOptions(load, "候補を取得できませんでした。")
    );

    await waitFor(() => expect(result.current.error).toBe("候補APIエラー"));
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});

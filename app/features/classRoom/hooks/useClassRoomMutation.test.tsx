import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ClassRoomMutationApi } from "~/features/classRoom/api/contracts/class-room-api";
import { useClassRoomMutation } from "~/features/classRoom/hooks/useClassRoomMutation";

function createApi(): ClassRoomMutationApi {
  return {
    createClassRoom: vi.fn(),
    deleteClassRoom: vi.fn().mockResolvedValue(undefined),
    updateClassRoom: vi.fn(),
  };
}

describe("useClassRoomMutation", () => {
  it("deleteはIDを渡し、成功時だけ一覧をrevalidateする", async () => {
    const api = createApi();
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useClassRoomMutation({ api, onRevalidate })
    );

    await act(async () => {
      await expect(result.current.remove(12)).resolves.toBe(true);
    });

    expect(api.deleteClassRoom).toHaveBeenCalledWith(12);
    expect(onRevalidate).toHaveBeenCalledOnce();
    expect(result.current.isMutating).toBe(false);
  });

  it("delete失敗時はfallback errorを表示し、再検証しない", async () => {
    const api = createApi();
    api.deleteClassRoom = vi.fn().mockRejectedValue(new Error("failed"));
    const onRevalidate = vi.fn();
    const { result } = renderHook(() =>
      useClassRoomMutation({ api, onRevalidate })
    );

    await act(async () => {
      await result.current.remove(12);
    });

    expect(result.current.error).toBe("クラスを削除できませんでした。");
    expect(onRevalidate).not.toHaveBeenCalled();
    expect(result.current.isMutating).toBe(false);
  });
});

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";

import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import { useGatheringMembers } from "~/features/event-gatherings/hooks/useGatheringMembers";

function createGateway(
  overrides: Partial<GatheringMemberGateway> = {}
): GatheringMemberGateway {
  return {
    loadCandidates: vi.fn(),
    loadMembers: vi.fn().mockResolvedValue([1001, 1002]),
    saveMembers: vi.fn(),
    ...overrides,
  };
}

describe("useGatheringMembers", () => {
  it("登録済みの参加者を読み込んで選択状態の初期値にする", async () => {
    const gateway = createGateway();
    const { result } = renderHook(() =>
      useGatheringMembers({ gatheringId: 101, gateway })
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedUserIds).toEqual([1001, 1002]);
    expect(gateway.loadMembers).toHaveBeenCalledWith(101);
  });

  it("保存は選択中の user_id をまとめて 1 回送り、保存後の一覧を反映する", async () => {
    const gateway = createGateway({
      saveMembers: vi.fn().mockResolvedValue([1001, 1003]),
    });
    const { result } = renderHook(() =>
      useGatheringMembers({ gatheringId: 101, gateway })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSelectedUserIds([1001, 1003]));
    let saved: number[] | null = null;
    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toEqual([1001, 1003]);
    expect(gateway.saveMembers).toHaveBeenCalledTimes(1);
    expect(gateway.saveMembers).toHaveBeenCalledWith(101, [1001, 1003]);
    expect(result.current.selectedUserIds).toEqual([1001, 1003]);
    expect(result.current.saveError).toBeNull();
  });

  it("保存に失敗しても選択を保持し、エラーを返す", async () => {
    const gateway = createGateway({
      saveMembers: vi
        .fn()
        .mockRejectedValue(
          new ApiClientError(404, "Not found", "GATHERING_NOT_FOUND")
        ),
    });
    const { result } = renderHook(() =>
      useGatheringMembers({ gatheringId: 101, gateway })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSelectedUserIds([1003]));
    let saved: number[] | null = [];
    await act(async () => {
      saved = await result.current.save();
    });

    expect(saved).toBeNull();
    expect(result.current.saveError).toBe("Not found");
    expect(result.current.selectedUserIds).toEqual([1003]);
    expect(result.current.isSaving).toBe(false);
  });

  it("読み込みに失敗したらエラーを保持する", async () => {
    const gateway = createGateway({
      loadMembers: vi.fn().mockRejectedValue(new Error("network")),
    });
    const { result } = renderHook(() =>
      useGatheringMembers({ gatheringId: 101, gateway })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe(
      "登録済みの参加者の取得に失敗しました。"
    );
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TeacherMutationApi } from "~/features/teachers/api/contracts/teacher-api";
import { useTeacherMutation } from "~/features/teachers/hooks/useTeacherMutation";

function createApi(): TeacherMutationApi {
  return {
    assignStaff: vi.fn().mockResolvedValue(undefined),
    createTeacher: vi.fn(),
    revokeStaff: vi.fn().mockResolvedValue(undefined),
    updateTeacher: vi.fn(),
    updateUserStatus: vi.fn().mockResolvedValue(undefined),
  };
}

describe("useTeacherMutation", () => {
  it("active/staff操作のuserIdとpayloadを正しいAPIへ渡す", async () => {
    const api = createApi();
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useTeacherMutation({ api, onRevalidate })
    );

    await act(async () => {
      await result.current.updateActive(11, false);
      await result.current.updateStaff(11, true);
    });

    expect(api.updateUserStatus).toHaveBeenCalledWith(11, {
      isLiveActive: false,
    });
    expect(api.assignStaff).toHaveBeenCalledWith(11);
    expect(onRevalidate).toHaveBeenCalledTimes(2);
  });

  it("create/updateは成功後のnavigation責務を持たず、成功を返す", async () => {
    const api = createApi();
    api.createTeacher = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => useTeacherMutation({ api }));

    await act(async () => {
      await expect(
        result.current.save(null, {
          classRoomIds: [],
          email: "new@example.com",
          userName: "新任",
        })
      ).resolves.toBe(true);
    });

    expect(api.createTeacher).toHaveBeenCalledWith({
      classRoomIds: [],
      email: "new@example.com",
      userName: "新任",
    });
    expect(result.current.isMutating).toBe(false);
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  StudentAccessMutationApi,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import { useStudentMutation } from "~/features/students/hooks/useStudentMutation";
import type { StudentRow } from "~/features/students/model/student";

const student: StudentRow = {
  studentId: 7,
  userId: 107,
  displayName: "山田太郎",
  studentIdNumber: "S007",
  attendanceNumber: 7,
  isLiveActive: true,
  isStaff: false,
  classRoom: { classRoomId: 1, classCode: "1A", className: "1年A組" },
};

function createApi(): StudentMutationApi {
  return {
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
  };
}

describe("useStudentMutation", () => {
  it("active/staff操作をuserIdへ委譲し、成功時だけrevalidateする", async () => {
    const userApi: StudentAccessMutationApi = {
      grantStaff: vi.fn().mockResolvedValue(undefined),
      revokeStaff: vi.fn().mockResolvedValue(undefined),
      updateUserStatus: vi.fn().mockResolvedValue(undefined),
    };
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useStudentMutation({ api: createApi(), onRevalidate, userApi })
    );

    await act(async () => {
      await result.current.updateActive(student, false);
      await result.current.updateStaff(student, true);
    });

    expect(userApi.updateUserStatus).toHaveBeenCalledWith(107, false);
    expect(userApi.grantStaff).toHaveBeenCalledWith(107);
    expect(onRevalidate).toHaveBeenCalledTimes(2);
  });

  it("失敗時はerrorを保持し、revalidateせずlockを解除する", async () => {
    const userApi: StudentAccessMutationApi = {
      grantStaff: vi.fn().mockRejectedValue(new Error("failed")),
      revokeStaff: vi.fn(),
      updateUserStatus: vi.fn(),
    };
    const onRevalidate = vi.fn();
    const { result } = renderHook(() =>
      useStudentMutation({ api: createApi(), onRevalidate, userApi })
    );

    await act(async () => {
      await result.current.updateStaff(student, true);
    });

    expect(result.current.error).toBe(
      "学生のstaff状態を更新できませんでした。"
    );
    expect(result.current.isMutating).toBe(false);
    expect(onRevalidate).not.toHaveBeenCalled();
  });
});

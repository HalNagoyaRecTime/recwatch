import { useManagementMutation } from "~/hooks/useManagementMutation";
import type {
  TeacherCreateRequest,
  TeacherMutationApi,
  TeacherUpdateRequest,
} from "~/features/teachers/api/contracts/teacher-api";

type UseTeacherMutationOptions = {
  api: TeacherMutationApi;
  onRevalidate?: () => Promise<void> | void;
};

export function useTeacherMutation({
  api,
  onRevalidate,
}: UseTeacherMutationOptions) {
  const { clearError, error, isMutating, run } = useManagementMutation({
    onRevalidate,
  });

  function save(
    teacherId: number | null,
    input: TeacherCreateRequest | TeacherUpdateRequest
  ) {
    return run(
      () =>
        teacherId === null
          ? api.createTeacher(input)
          : api.updateTeacher(teacherId, input),
      teacherId === null
        ? "教官の登録に失敗しました。"
        : "教官情報の更新に失敗しました。"
    );
  }

  function updateActive(userId: number, isLiveActive: boolean) {
    return run(
      () => api.updateUserStatus(userId, { isLiveActive }),
      "教官の状態変更に失敗しました。",
      true
    );
  }

  function updateStaff(userId: number, isStaff: boolean) {
    return run(
      () => (isStaff ? api.assignStaff(userId) : api.revokeStaff(userId)),
      "教官の状態変更に失敗しました。",
      true
    );
  }

  return {
    clearError,
    error,
    isMutating,
    save,
    updateActive,
    updateStaff,
  };
}

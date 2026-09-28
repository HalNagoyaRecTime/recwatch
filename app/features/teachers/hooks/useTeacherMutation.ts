import { useRef, useState } from "react";

import type {
  TeacherMutationApi,
  TeacherUpdateRequest,
} from "~/features/teachers/api/contracts/teacher-api";
import type { TeacherCreateRequest } from "~/features/teachers/api/contracts/teacher-api";
import { getErrorMessage } from "~/lib/client-error";

type UseTeacherMutationOptions = {
  api: TeacherMutationApi;
  onRevalidate?: () => Promise<void> | void;
};

export function useTeacherMutation({
  api,
  onRevalidate,
}: UseTeacherMutationOptions) {
  const mutationLock = useRef(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runMutation(
    operation: () => Promise<unknown>,
    fallbackMessage: string,
    shouldRevalidate = false
  ) {
    if (mutationLock.current) return false;

    mutationLock.current = true;
    setIsMutating(true);
    setError(null);
    try {
      await operation();
      if (shouldRevalidate) await onRevalidate?.();
      return true;
    } catch (reason) {
      setError(getErrorMessage(reason, fallbackMessage));
      return false;
    } finally {
      mutationLock.current = false;
      setIsMutating(false);
    }
  }

  function save(
    teacherId: number | null,
    input: TeacherCreateRequest | TeacherUpdateRequest
  ) {
    return runMutation(
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
    return runMutation(
      () => api.updateUserStatus(userId, { isLiveActive }),
      "教官の状態変更に失敗しました。",
      true
    );
  }

  function updateStaff(userId: number, isStaff: boolean) {
    return runMutation(
      () => (isStaff ? api.assignStaff(userId) : api.revokeStaff(userId)),
      "教官の状態変更に失敗しました。",
      true
    );
  }

  return {
    clearError: () => setError(null),
    error,
    isMutating,
    save,
    updateActive,
    updateStaff,
  };
}

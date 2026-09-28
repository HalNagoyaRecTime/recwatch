import { useRef, useState } from "react";

import type {
  StudentAccessMutationApi,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import type {
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";
import { getErrorMessage } from "~/lib/client-error";

type UseStudentMutationOptions = {
  api: StudentMutationApi;
  onRevalidate?: () => Promise<void> | void;
  userApi: StudentAccessMutationApi;
};

export function useStudentMutation({
  api,
  onRevalidate,
  userApi,
}: UseStudentMutationOptions) {
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

  function save(studentId: number | null, input: StudentWriteInput) {
    return runMutation(
      () =>
        studentId === null
          ? api.createStudent(input)
          : api.updateStudent(studentId, input),
      "学生を保存できませんでした。"
    );
  }

  function updateActive(student: StudentRow, isLiveActive: boolean) {
    return runMutation(
      () => userApi.updateUserStatus(student.userId, isLiveActive),
      "学生の有効状態を更新できませんでした。",
      true
    );
  }

  function updateStaff(student: StudentRow, isStaff: boolean) {
    return runMutation(
      () =>
        isStaff
          ? userApi.grantStaff(student.userId)
          : userApi.revokeStaff(student.userId),
      "学生のstaff状態を更新できませんでした。",
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

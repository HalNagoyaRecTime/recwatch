import { useManagementMutation } from "~/hooks/useManagementMutation";
import type {
  StudentAccessMutationApi,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import type {
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";

type UseStudentMutationOptions = {
  api: StudentMutationApi;
  onRevalidate?: () => Promise<void> | void;
  userApi?: StudentAccessMutationApi;
};

export function useStudentMutation({
  api,
  onRevalidate,
  userApi,
}: UseStudentMutationOptions) {
  const { clearError, error, isMutating, run } = useManagementMutation({
    onRevalidate,
  });

  function save(studentId: number | null, input: StudentWriteInput) {
    return run(
      () =>
        studentId === null
          ? api.createStudent(input)
          : api.updateStudent(studentId, input),
      "学生を保存できませんでした。"
    );
  }

  function updateActive(student: StudentRow, isLiveActive: boolean) {
    return run(
      () =>
        userApi?.updateUserStatus(student.userId, isLiveActive) ??
        Promise.reject(new Error("学生の有効状態を更新できませんでした。")),
      "学生の有効状態を更新できませんでした。",
      true
    );
  }

  function updateStaff(student: StudentRow, isStaff: boolean) {
    return run(
      () =>
        userApi
          ? isStaff
            ? userApi.grantStaff(student.userId)
            : userApi.revokeStaff(student.userId)
          : Promise.reject(
              new Error("学生のstaff状態を更新できませんでした。")
            ),
      "学生のstaff状態を更新できませんでした。",
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

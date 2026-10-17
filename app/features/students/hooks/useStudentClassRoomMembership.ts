import type { StudentMutationApi } from "~/features/students/api/contracts/student-api";
import type {
  StudentClassRoomAssignmentInput,
  StudentWriteInput,
} from "~/features/students/model/student";
import { useManagementMutation } from "~/hooks/useManagementMutation";

export function useStudentClassRoomMembership({
  api,
  onRevalidate,
}: {
  api: StudentMutationApi;
  onRevalidate: () => Promise<void> | void;
}) {
  const { clearError, error, isMutating, run } = useManagementMutation({
    onRevalidate,
  });

  function updateClassRoom(
    studentId: number,
    input: StudentClassRoomAssignmentInput
  ) {
    return run(
      () => api.updateStudentClassRoom(studentId, input),
      "学生の所属を変更できませんでした。",
      true
    );
  }

  function createStudent(input: StudentWriteInput) {
    return run(
      () => api.createStudent(input),
      "学生を登録できませんでした。",
      true
    );
  }

  return { clearError, createStudent, error, isMutating, updateClassRoom };
}

import { FormModal } from "~/components/ui/modal/FormModal";
import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import type {
  StudentAccessMutationApi,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import { StudentForm } from "~/features/students/components/StudentForm";
import { useStudentMutation } from "~/features/students/hooks/useStudentMutation";
import { useLatestAfterConflict } from "~/hooks/useLatestAfterConflict";
import type { ManagementOptionState } from "~/hooks/useManagementOptions";
import type {
  StudentClassRoomOption,
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";

type StudentEditPageProps = {
  api: StudentMutationApi;
  classRooms: readonly StudentClassRoomOption[];
  classRoomOptions?: ManagementOptionState<StudentClassRoomOption>;
  loadLatest: () => Promise<StudentRow>;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  student: StudentRow;
  userApi: StudentAccessMutationApi;
};

export function StudentEditPage({
  api,
  classRoomOptions,
  classRooms,
  loadLatest,
  onClose,
  onSaved,
  student: loadedStudent,
  userApi,
}: StudentEditPageProps) {
  const { current: student, reloadLatest } = useLatestAfterConflict(
    loadedStudent,
    loadLatest
  );
  const classRoomOptionState = classRoomOptions ?? {
    error: null,
    isLoading: false,
    items: classRooms,
  };
  const {
    error: submitError,
    isMutating: isSubmitting,
    save,
  } = useStudentMutation({
    api,
    onConflict: reloadLatest,
    userApi,
  });

  async function handleSubmit(input: StudentWriteInput) {
    if (
      await save(student.studentId, {
        ...input,
        lockVersion: student.lockVersion,
      })
    ) {
      await onSaved();
    }
  }

  return (
    <FormModal
      description={`学生ID: ${student.studentId}`}
      onClose={onClose}
      title="学生を編集"
    >
      <ManagementOptionFeedback
        label="クラス候補"
        state={classRoomOptionState}
      />
      {!classRoomOptionState.isLoading && !classRoomOptionState.error ? (
        // 競合後の再取得で版が変わったら、編集中の内容を捨てて最新の値で作り直す。
        <StudentForm
          key={student.lockVersion}
          classRooms={classRoomOptionState.items}
          initialStudent={student}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      ) : null}
    </FormModal>
  );
}

import { FormModal } from "~/components/ui/modal/FormModal";
import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import type {
  StudentAccessMutationApi,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import { StudentForm } from "~/features/students/components/StudentForm";
import { useStudentMutation } from "~/features/students/hooks/useStudentMutation";
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
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  student: StudentRow;
  userApi: StudentAccessMutationApi;
};

export function StudentEditPage({
  api,
  classRoomOptions,
  classRooms,
  onClose,
  onSaved,
  student,
  userApi,
}: StudentEditPageProps) {
  const classRoomOptionState = classRoomOptions ?? {
    error: null,
    isLoading: false,
    items: classRooms,
  };
  const {
    error: submitError,
    isMutating: isSubmitting,
    save,
  } = useStudentMutation({ api, userApi });

  async function handleSubmit(input: StudentWriteInput) {
    if (await save(student.studentId, input)) await onSaved();
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
        <StudentForm
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

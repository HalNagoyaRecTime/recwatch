import { FormModal } from "~/components/ui/modal/FormModal";
import type {
  StudentAccessMutationApi,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import { StudentForm } from "~/features/students/components/StudentForm";
import { useStudentMutation } from "~/features/students/hooks/useStudentMutation";
import type {
  StudentClassRoomOption,
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";

type StudentEditPageProps = {
  api: StudentMutationApi;
  classRooms: readonly StudentClassRoomOption[];
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  student: StudentRow;
  userApi: StudentAccessMutationApi;
};

export function StudentEditPage({
  api,
  classRooms,
  onClose,
  onSaved,
  student,
  userApi,
}: StudentEditPageProps) {
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
      <StudentForm
        classRooms={classRooms}
        initialStudent={student}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onSubmit={handleSubmit}
        submitError={submitError}
      />
    </FormModal>
  );
}

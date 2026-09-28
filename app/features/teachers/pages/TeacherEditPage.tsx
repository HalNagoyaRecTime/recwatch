import type { TeacherMutationApi } from "~/features/teachers/api/contracts/teacher-api";
import { useTeacherMutation } from "~/features/teachers/hooks/useTeacherMutation";
import {
  TeacherForm,
  type TeacherFormInput,
} from "~/features/teachers/components/TeacherForm";
import { TeacherFormModal } from "~/features/teachers/components/TeacherFormModal";
import type {
  ClassRoomOption,
  TeacherRow,
} from "~/features/teachers/model/teacher";

export function TeacherEditPage({
  api,
  classRooms,
  onClose,
  onSaved,
  teacher,
}: {
  api: TeacherMutationApi;
  classRooms: readonly ClassRoomOption[];
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  teacher: TeacherRow;
}) {
  const {
    error: submitError,
    isMutating: isSubmitting,
    save,
  } = useTeacherMutation({ api });

  async function handleSubmit(input: TeacherFormInput) {
    if (await save(teacher.teacherId, input)) {
      await onSaved();
    }
  }

  return (
    <TeacherFormModal
      description={`教官ID: ${teacher.teacherId}`}
      onClose={onClose}
      title="教官情報を編集"
    >
      {(requestClose) => (
        <TeacherForm
          classRooms={classRooms}
          initialTeacher={teacher}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      )}
    </TeacherFormModal>
  );
}

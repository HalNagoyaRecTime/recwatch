import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
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
import type { ManagementOptionState } from "~/hooks/useManagementOptions";

export function TeacherEditPage({
  api,
  classRoomOptions,
  classRooms,
  onConflict,
  onClose,
  onSaved,
  teacher,
}: {
  api: TeacherMutationApi;
  classRooms: readonly ClassRoomOption[];
  classRoomOptions?: ManagementOptionState<ClassRoomOption>;
  onConflict: () => Promise<void> | void;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  teacher: TeacherRow;
}) {
  const classRoomOptionState = classRoomOptions ?? {
    error: null,
    isLoading: false,
    items: classRooms,
  };
  const {
    error: submitError,
    isMutating: isSubmitting,
    save,
  } = useTeacherMutation({ api, onConflict });

  async function handleSubmit(input: TeacherFormInput) {
    if (
      await save(teacher.teacherId, {
        ...input,
        lockVersion: teacher.lockVersion,
      })
    ) {
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
        <>
          <ManagementOptionFeedback
            label="クラス候補"
            state={classRoomOptionState}
          />
          {!classRoomOptionState.isLoading && !classRoomOptionState.error ? (
            // 競合後の再取得で版が変わったら、編集中の内容を捨てて最新の値で作り直す。
            <TeacherForm
              key={teacher.lockVersion}
              classRooms={classRoomOptionState.items}
              initialTeacher={teacher}
              isSubmitting={isSubmitting}
              onCancel={requestClose}
              onSubmit={handleSubmit}
              submitError={submitError}
            />
          ) : null}
        </>
      )}
    </TeacherFormModal>
  );
}

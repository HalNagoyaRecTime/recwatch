import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import type { TeacherMutationApi } from "~/features/teachers/api/contracts/teacher-api";
import { useTeacherMutation } from "~/features/teachers/hooks/useTeacherMutation";
import {
  TeacherForm,
  type TeacherFormInput,
} from "~/features/teachers/components/TeacherForm";
import { TeacherFormModal } from "~/features/teachers/components/TeacherFormModal";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import type { ManagementOptionState } from "~/hooks/useManagementOptions";

export function TeacherCreatePage({
  api,
  classRoomOptions,
  classRooms,
  onClose,
  onSaved,
}: {
  api: TeacherMutationApi;
  classRooms: readonly ClassRoomOption[];
  classRoomOptions?: ManagementOptionState<ClassRoomOption>;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
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
  } = useTeacherMutation({ api });

  async function handleSubmit(input: TeacherFormInput) {
    if (await save(null, input)) {
      await onSaved();
    }
  }

  return (
    <TeacherFormModal
      description="先生名とメールアドレス、担当クラスを登録します。"
      onClose={onClose}
      title="教官を新規登録"
    >
      {(requestClose) => (
        <>
          <ManagementOptionFeedback
            label="クラス候補"
            state={classRoomOptionState}
          />
          {!classRoomOptionState.isLoading && !classRoomOptionState.error ? (
            <TeacherForm
              classRooms={classRoomOptionState.items}
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

import { useState } from "react";
import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import { FormModal } from "~/components/ui/modal/FormModal";
import type { ClassRoomMutationApi } from "~/features/classRoom/api/contracts/class-room-api";
import {
  ClassRoomForm,
  type ClassRoomTeacherOption,
} from "~/features/classRoom/components/ClassRoomForm";
import { useClassRoomMutation } from "~/features/classRoom/hooks/useClassRoomMutation";
import { emptyClassRoomForm } from "~/features/classRoom/model/classRoom-form";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";
import type { ManagementOptionState } from "~/hooks/useManagementOptions";

type ClassRoomCreatePageProps = {
  api: ClassRoomMutationApi;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  teacherOptionState?: ManagementOptionState<ClassRoomTeacherOption>;
  teacherOptions: readonly ClassRoomTeacherOption[];
};

export function ClassRoomCreatePage({
  api,
  onClose,
  onSaved,
  teacherOptionState,
  teacherOptions,
}: ClassRoomCreatePageProps) {
  const teacherOptionsState = teacherOptionState ?? {
    error: null,
    isLoading: false,
    items: teacherOptions,
  };
  const [form, setForm] = useState<ClassRoomWriteInput>(emptyClassRoomForm);
  const {
    clearError,
    create,
    error: submitError,
    isMutating: isSubmitting,
  } = useClassRoomMutation({ api });

  async function handleSubmit(input: ClassRoomWriteInput) {
    if (await create(input)) {
      await onSaved();
    }
  }

  return (
    <FormModal
      description="クラスコード、クラス名、担当教官を入力します"
      onClose={() => {
        clearError();
        void onClose();
      }}
      title="クラスの新規登録"
    >
      <ManagementOptionFeedback
        label="担当教官候補"
        state={teacherOptionsState}
      />
      {!teacherOptionsState.isLoading && !teacherOptionsState.error ? (
        <ClassRoomForm
          form={form}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitError={submitError}
          teacherOptions={teacherOptionsState.items}
        />
      ) : null}
    </FormModal>
  );
}

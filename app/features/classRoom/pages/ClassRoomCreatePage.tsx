import { useState } from "react";
import { FormModal } from "~/components/ui/modal/FormModal";
import type { ClassRoomMutationApi } from "~/features/classRoom/api/contracts/class-room-api";
import {
  ClassRoomForm,
  type ClassRoomTeacherOption,
} from "~/features/classRoom/components/ClassRoomForm";
import { useClassRoomMutation } from "~/features/classRoom/hooks/useClassRoomMutation";
import { emptyClassRoomForm } from "~/features/classRoom/model/classRoom-form";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";

type ClassRoomCreatePageProps = {
  api: ClassRoomMutationApi;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  teacherOptions: readonly ClassRoomTeacherOption[];
};

export function ClassRoomCreatePage({
  api,
  onClose,
  onSaved,
  teacherOptions,
}: ClassRoomCreatePageProps) {
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
      <ClassRoomForm
        form={form}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitError={submitError}
        teacherOptions={teacherOptions}
      />
    </FormModal>
  );
}

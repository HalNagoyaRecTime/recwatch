import { useState } from "react";

import { FormModal } from "~/components/ui/modal/FormModal";
import type { ClassRoomMutationApi } from "~/features/classRoom/api/contracts/class-room-api";
import {
  ClassRoomForm,
  type ClassRoomTeacherOption,
} from "~/features/classRoom/components/ClassRoomForm";
import { useClassRoomMutation } from "~/features/classRoom/hooks/useClassRoomMutation";
import type {
  ClassRoom,
  ClassRoomWriteInput,
} from "~/features/classRoom/model/classRoom";

type ClassRoomEditPageProps = {
  api: ClassRoomMutationApi;
  classRoom: ClassRoom;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  teacherOptions: readonly ClassRoomTeacherOption[];
};

export function ClassRoomEditPage({
  api,
  classRoom,
  onClose,
  onSaved,
  teacherOptions,
}: ClassRoomEditPageProps) {
  const [form, setForm] = useState<ClassRoomWriteInput>(() => ({
    classCode: classRoom.classCode,
    className: classRoom.className,
    teacherId: classRoom.teacher?.teacherId ?? null,
  }));
  const {
    error: submitError,
    isMutating: isSubmitting,
    update,
  } = useClassRoomMutation({ api });

  async function handleSubmit(input: ClassRoomWriteInput) {
    if (await update(classRoom.classRoomId, input)) await onSaved();
  }

  return (
    <FormModal
      description={`クラスID: ${classRoom.classRoomId}`}
      onClose={onClose}
      title="クラスを編集"
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

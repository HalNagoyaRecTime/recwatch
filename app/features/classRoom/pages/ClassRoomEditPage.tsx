import { useState } from "react";

import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
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
import type { ManagementOptionState } from "~/hooks/useManagementOptions";

type ClassRoomEditPageProps = {
  api: ClassRoomMutationApi;
  classRoom: ClassRoom;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  teacherOptionState?: ManagementOptionState<ClassRoomTeacherOption>;
  teacherOptions: readonly ClassRoomTeacherOption[];
};

export function ClassRoomEditPage({
  api,
  classRoom,
  onClose,
  onSaved,
  teacherOptionState,
  teacherOptions,
}: ClassRoomEditPageProps) {
  const teacherOptionsState = teacherOptionState ?? {
    error: null,
    isLoading: false,
    items: teacherOptions,
  };
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

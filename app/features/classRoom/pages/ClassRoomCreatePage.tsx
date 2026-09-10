import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import type { ClassRoomManagementApi } from "~/features/classRoom/api/contracts/class-room-api";
import {
  ClassRoomForm,
  type ClassRoomTeacherOption,
} from "~/features/classRoom/components/ClassRoomForm";
import { useClassRoomMutation } from "~/features/classRoom/hooks/useClassRoomMutation";
import { emptyClassRoomForm } from "~/features/classRoom/model/classRoom-form";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";

type ClassRoomCreatePageProps = {
  api: ClassRoomManagementApi;
  onRevalidate?: () => Promise<void> | void;
  teacherOptions: readonly ClassRoomTeacherOption[];
};

export function ClassRoomCreatePage({
  api,
  onRevalidate,
  teacherOptions,
}: ClassRoomCreatePageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState<ClassRoomWriteInput>(emptyClassRoomForm);
  const {
    clearError,
    create,
    error: submitError,
    isMutating: isSubmitting,
  } = useClassRoomMutation({
    api,
    refresh: async () => {
      await onRevalidate?.();
      return null;
    },
  });

  function navigateToList() {
    navigate(`/classroom${location.search}`);
  }

  async function handleSubmit(input: ClassRoomWriteInput) {
    if (await create(input)) {
      navigateToList();
    }
  }

  return (
    <FormModal
      description="クラスコード、クラス名、担当教官を入力します"
      onClose={() => {
        clearError();
        navigateToList();
      }}
      title="クラスの新規登録"
    >
      <ClassRoomForm
        form={form}
        isSubmitting={isSubmitting}
        onCancel={navigateToList}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitError={submitError}
        teacherOptions={teacherOptions}
      />
    </FormModal>
  );
}

import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import type { ClassRoomManagementApi } from "~/features/classRoom/api/contracts/class-room-api";
import {
  ClassRoomForm,
  type ClassRoomTeacherOption,
} from "~/features/classRoom/components/ClassRoomForm";
import { emptyClassRoomForm } from "~/features/classRoom/model/classRoom-form";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";
import { getErrorMessage } from "~/lib/client-error";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function navigateToList() {
    navigate(`/classroom${location.search}`);
  }

  async function handleSubmit(input: ClassRoomWriteInput) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.createClassRoom(input);
      await onRevalidate?.();
      navigateToList();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "クラスの登録に失敗しました。"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal
      description="クラスコード、クラス名、担当教官を入力します"
      onClose={navigateToList}
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

import { useState } from "react";
import { useLocation, useNavigate, useRevalidator } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import {
  ClassRoomApi,
  type ClassRoomManagementApi,
} from "~/features/classRoom/api";
import {
  ClassRoomForm,
  type ClassRoomTeacherOption,
} from "~/features/classRoom/components/ClassRoomForm";
import { emptyClassRoomForm } from "~/features/classRoom/model/classRoom-form";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";
import { getErrorMessage } from "~/lib/client-error";

type ClassRoomCreatePageProps = {
  api?: ClassRoomManagementApi;
  teacherOptions: readonly ClassRoomTeacherOption[];
};

export function ClassRoomCreatePage({
  api = ClassRoomApi,
  teacherOptions,
}: ClassRoomCreatePageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
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
      await revalidator.revalidate();
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

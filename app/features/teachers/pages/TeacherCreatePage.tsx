import { useState } from "react";
import { useLocation, useNavigate, useRevalidator } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import { teacherListTarget } from "~/features/teachers/application/teacher-navigation";
import {
  TeacherForm,
  type TeacherFormInput,
} from "~/features/teachers/components/TeacherForm";
import { TeacherFormModal } from "~/features/teachers/components/TeacherFormModal";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import { getErrorMessage } from "~/lib/client-error";

export function TeacherCreatePage({
  classRooms,
}: {
  classRooms: readonly ClassRoomOption[];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(input: TeacherFormInput) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await TeacherApi.createTeacher(input);
      await revalidator.revalidate();
      navigate(teacherListTarget(location.search));
    } catch (error) {
      setSubmitError(getErrorMessage(error, "教官の登録に失敗しました。"));
      setIsSubmitting(false);
    }
  }

  const close = () => navigate(teacherListTarget(location.search));

  return (
    <TeacherFormModal
      description="先生名と担当クラスを登録します。"
      onClose={close}
      title="教官を新規登録"
    >
      {(requestClose) => (
        <TeacherForm
          classRooms={classRooms}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      )}
    </TeacherFormModal>
  );
}

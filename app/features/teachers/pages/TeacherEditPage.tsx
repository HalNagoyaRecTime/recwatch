import { useState } from "react";
import { useLocation, useNavigate, useRevalidator } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import { TeacherForm } from "~/features/teachers/components/TeacherForm";
import { TeacherFormModal } from "~/features/teachers/components/TeacherFormModal";
import type {
  ClassRoomOption,
  TeacherRow,
} from "~/features/teachers/model/teacher";

type TeacherEditPageProps = {
  classRooms: readonly ClassRoomOption[];
  teacher: TeacherRow;
};

export function TeacherEditPage({ classRooms, teacher }: TeacherEditPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(
    input: {
      classRoomIds: number[];
      userName: string;
    },
    requestClose: () => void
  ) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await TeacherApi.updateTeacher(teacher.teacherId, input);
      revalidator.revalidate();
      requestClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "教官情報の更新に失敗しました。"
      );
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    navigate({ pathname: "/teachers", search: location.search });
  }

  return (
    <TeacherFormModal
      description={`teacher_id: ${teacher.teacherId}`}
      onClose={handleClose}
      title="教官情報を編集"
    >
      {(requestClose) => (
        <TeacherForm
          classRooms={classRooms}
          initialTeacher={teacher}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={(input) => void handleSubmit(input, requestClose)}
          submitError={submitError}
        />
      )}
    </TeacherFormModal>
  );
}

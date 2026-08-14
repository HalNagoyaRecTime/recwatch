import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import {
  TeacherForm,
  type TeacherFormInput,
} from "~/features/teachers/components/TeacherForm";
import { TeacherFormModal } from "~/features/teachers/components/TeacherFormModal";
import type {
  ClassRoomOption,
  TeacherRow,
} from "~/features/teachers/model/teacher";

export function TeacherEditPage({
  classRooms,
  teacher,
}: {
  classRooms: readonly ClassRoomOption[];
  teacher: TeacherRow;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(input: TeacherFormInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await TeacherApi.updateTeacher(teacher.teacherId, input);
      close();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "教官情報の更新に失敗しました。"
      );
      setIsSubmitting(false);
    }
  }

  function close() {
    navigate({ pathname: "/teachers", search: location.search });
  }

  return (
    <TeacherFormModal
      description={`teacher_id: ${teacher.teacherId}`}
      onClose={close}
      title="教官情報を編集"
    >
      {(requestClose) => (
        <TeacherForm
          classRooms={classRooms}
          initialTeacher={teacher}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      )}
    </TeacherFormModal>
  );
}

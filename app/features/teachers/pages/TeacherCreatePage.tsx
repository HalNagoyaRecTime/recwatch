import { useState } from "react";
import { useLocation, useNavigate, useRevalidator } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import { TeacherForm } from "~/features/teachers/components/TeacherForm";
import { TeacherFormModal } from "~/features/teachers/components/TeacherFormModal";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";

type TeacherCreatePageProps = {
  classRooms: readonly ClassRoomOption[];
};

export function TeacherCreatePage({ classRooms }: TeacherCreatePageProps) {
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
      await TeacherApi.createTeacher(input);
      revalidator.revalidate();
      requestClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "教官の登録に失敗しました。"
      );
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    navigate({ pathname: "/teachers", search: location.search });
  }

  return (
    <TeacherFormModal
      description="教官名と担当クラスを登録します。"
      onClose={handleClose}
      title="教官を新規登録"
    >
      {(requestClose) => (
        <TeacherForm
          autoFocus
          classRooms={classRooms}
          isSubmitting={isSubmitting}
          onCancel={requestClose}
          onSubmit={({ classRoomIds, userName }) =>
            void handleSubmit({ classRoomIds, userName }, requestClose)
          }
          submitError={submitError}
        />
      )}
    </TeacherFormModal>
  );
}

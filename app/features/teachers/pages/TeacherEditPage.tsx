import { useState } from "react";
import { useNavigate } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import { TeacherForm } from "~/features/teachers/components/TeacherForm";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(input: {
    classRoomIds: number[];
    isLiveActive: boolean;
    userName: string;
  }) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await TeacherApi.updateTeacher(teacher.teacherId, input);
      navigate("/teachers");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "教官情報の更新に失敗しました。"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5">
      <div>
        <h1 className="app-text-title">教官情報を編集</h1>
        <p className="text-text-muted mt-1 text-sm">
          teacher_id: {teacher.teacherId}
        </p>
      </div>
      <TeacherForm
        classRooms={classRooms}
        initialTeacher={teacher}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/teachers")}
        onSubmit={handleSubmit}
        submitError={submitError}
      />
    </section>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import { TeacherForm } from "~/features/teachers/components/TeacherForm";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";

type TeacherCreatePageProps = {
  classRooms: readonly ClassRoomOption[];
};

export function TeacherCreatePage({ classRooms }: TeacherCreatePageProps) {
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
      await TeacherApi.createTeacher(input);
      navigate("/teachers");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "教官の登録に失敗しました。"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5">
      <div>
        <h1 className="app-text-title">教官を新規登録</h1>
        <p className="text-text-muted mt-1 text-sm">
          先生名と担当クラスを登録します。
        </p>
      </div>
      <TeacherForm
        classRooms={classRooms}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/teachers")}
        onSubmit={handleSubmit}
        submitError={submitError}
      />
    </section>
  );
}

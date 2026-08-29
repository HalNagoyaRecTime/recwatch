import { useState } from "react";
import { useNavigate } from "react-router";

import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { httpCompetitionEditorApi } from "~/features/sports/api/http-competition-editor-api";
import { CompetitionForm } from "~/features/sports/components/CompetitionForm";
import {
  emptyCompetitionForm,
  validateCompetitionForm,
} from "~/features/sports/model/competition-form";

type CompetitionCreatePageProps = {
  api?: CompetitionEditorApi;
};

export function CompetitionCreatePage({
  api = httpCompetitionEditorApi,
}: CompetitionCreatePageProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyCompetitionForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    const result = validateCompetitionForm(form);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.create(result.input);
      navigate("/events");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "イベントデータの登録に失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CompetitionForm
      isDisabled={isSubmitting}
      isSubmitting={isSubmitting}
      onCancel={() => navigate("/events")}
      onChange={setForm}
      onSubmit={() => void handleSubmit()}
      submitError={submitError}
      submitLabel="登録する"
      title="イベントの新規登録"
      value={form}
    />
  );
}

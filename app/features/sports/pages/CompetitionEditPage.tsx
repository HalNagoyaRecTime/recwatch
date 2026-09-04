import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { httpCompetitionEditorApi } from "~/features/sports/api/http-competition-editor-api";
import { CompetitionForm } from "~/features/sports/components/CompetitionForm";
import { getErrorMessage } from "~/lib/client-error";
import {
  emptyCompetitionForm,
  validateCompetitionForm,
} from "~/features/sports/model/competition-form";

type CompetitionEditPageProps = {
  api?: CompetitionEditorApi;
};

export function CompetitionEditPage({
  api = httpCompetitionEditorApi,
}: CompetitionEditPageProps) {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const eventId = Number(competitionId);
  const [form, setForm] = useState(emptyCompetitionForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve().then(async () => {
      if (!isCurrent) return;
      setIsLoading(true);
      setLoadError(null);

      if (!Number.isInteger(eventId) || eventId <= 0) {
        setLoadError("イベントIDが不正です。");
        setIsLoading(false);
        return;
      }

      try {
        const value = await api.get(eventId);
        if (isCurrent) setForm(value);
      } catch (error) {
        if (!isCurrent) return;
        setLoadError(
          getErrorMessage(error, "イベントデータの取得に失敗しました。")
        );
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [api, eventId]);

  async function handleSubmit() {
    if (
      isLoading ||
      isSubmitting ||
      loadError ||
      !Number.isInteger(eventId) ||
      eventId <= 0
    ) {
      return;
    }

    const result = validateCompetitionForm(form);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.update(eventId, result.input);
      navigate("/events");
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "イベントデータの更新に失敗しました。")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CompetitionForm
      isDisabled={isLoading || isSubmitting || Boolean(loadError)}
      isSubmitting={isSubmitting}
      onCancel={() => navigate("/events")}
      onChange={setForm}
      onSubmit={() => void handleSubmit()}
      submitError={loadError ?? submitError}
      submitLabel="変更を保存する"
      title="イベントを編集"
      value={form}
    />
  );
}

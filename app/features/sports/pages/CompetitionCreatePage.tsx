import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { httpCompetitionEditorApi } from "~/features/sports/api/http-competition-editor-api";
import { CompetitionConfirmStep } from "~/features/sports/components/CompetitionConfirmStep";
import { CompetitionCreatedStep } from "~/features/sports/components/CompetitionCreatedStep";
import { CompetitionForm } from "~/features/sports/components/CompetitionForm";
import { getErrorMessage } from "~/lib/client-error";
import type { CompetitionListOutletContext } from "~/features/sports/pages/CompetitionListPage";
import {
  emptyCompetitionForm,
  validateCompetitionForm,
} from "~/features/sports/model/competition-form";

type CompetitionCreatePageProps = {
  api?: CompetitionEditorApi;
};

type Step = "form" | "confirm" | "done";

const stepDescription: Record<Step, string> = {
  form: "まずイベント本体だけを作成します。",
  confirm:
    "この内容で作成します。よろしければ「イベントを作成」を押してください。",
  done: "イベントの作成が完了しました。",
};

export function CompetitionCreatePage({
  api = httpCompetitionEditorApi,
}: CompetitionCreatePageProps) {
  const navigate = useNavigate();
  // 一覧の子ルートとして開かれた場合のみ受け取れる。テストなど単体描画時は undefined。
  const outletContext = useOutletContext<
    CompetitionListOutletContext | undefined
  >();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState(emptyCompetitionForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleConfirm() {
    const result = validateCompetitionForm(form);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    setSubmitError(null);
    setStep("confirm");
  }

  async function handleCreate() {
    const result = validateCompetitionForm(form);
    if ("error" in result) {
      setSubmitError(result.error);
      setStep("form");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.create(result.input);
      outletContext?.reload();
      setStep("done");
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "イベントデータの登録に失敗しました。")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormModal
      description={stepDescription[step]}
      onClose={() => navigate("/events")}
      size="xl"
      title="イベントを新規作成"
    >
      {(requestClose) => {
        if (step === "done") {
          return (
            <CompetitionCreatedStep
              competitionName={form.name.trim()}
              onClose={requestClose}
            />
          );
        }

        if (step === "confirm") {
          return (
            <CompetitionConfirmStep
              isSubmitting={isSubmitting}
              onBack={() => setStep("form")}
              onSubmit={() => void handleCreate()}
              submitError={submitError}
              value={form}
            />
          );
        }

        return (
          <CompetitionForm
            isDisabled={isSubmitting}
            isSubmitting={isSubmitting}
            onCancel={requestClose}
            onChange={setForm}
            onSubmit={handleConfirm}
            submitError={submitError}
            submitIcon={ArrowRight}
            submitLabel="確認へ"
            value={form}
          />
        );
      }}
    </FormModal>
  );
}

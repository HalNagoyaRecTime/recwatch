import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import type { EventGatheringSettingsGateway } from "~/features/event-gatherings/api/contracts/event-gathering-settings-gateway";
import type { GatheringMemberGateway } from "~/features/event-gatherings/api/contracts/gathering-member-gateway";
import { GatheringSettingsStep } from "~/features/event-gatherings/components/GatheringSettingsStep";
import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { CompetitionEditorApi } from "~/features/sports/api/competition-editor-api";
import { httpCompetitionEditorApi } from "~/features/sports/api/http-competition-editor-api";
import { CompetitionConfirmStep } from "~/features/sports/components/CompetitionConfirmStep";
import { CompetitionCreatedStep } from "~/features/sports/components/CompetitionCreatedStep";
import { CompetitionCreateSteps } from "~/features/sports/components/CompetitionCreateSteps";
import { CompetitionForm } from "~/features/sports/components/CompetitionForm";
import { getErrorMessage } from "~/lib/client-error";
import type { CompetitionListOutletContext } from "~/features/sports/pages/CompetitionListPage";
import {
  emptyCompetitionForm,
  validateCompetitionForm,
} from "~/features/sports/model/competition-form";

type CompetitionCreatePageProps = {
  api?: CompetitionEditorApi;
  gatheringMemberGateway?: GatheringMemberGateway;
  gatheringSettingsGateway?: EventGatheringSettingsGateway;
  gatheringSpotGateway?: GatheringSpotGateway;
};

type Step = "form" | "confirm" | "done" | "gatherings";

const stepDescription: Record<Step, string> = {
  form: "まずイベント本体だけを作成します。",
  confirm:
    "この内容で作成します。よろしければ「イベントを作成」を押してください。",
  done: "イベントの作成が完了しました。",
  gatherings: "作成したイベントに、Roundごとの集合時間・集合場所を設定します。",
};

export function CompetitionCreatePage({
  api = httpCompetitionEditorApi,
  gatheringMemberGateway,
  gatheringSettingsGateway,
  gatheringSpotGateway,
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
  // 作成が成功したイベントの ID。集合設定ステップはこの ID に対して保存する。
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);

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
      const created = await api.create(result.input);
      setCreatedEventId(created.id);
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
      {(requestClose) => (
        <div className="space-y-6">
          <CompetitionCreateSteps
            current={step === "gatherings" ? "gatherings" : "event"}
          />

          {step === "gatherings" && createdEventId !== null ? (
            <GatheringSettingsStep
              backLabel="戻る"
              eventId={createdEventId}
              memberGateway={gatheringMemberGateway}
              onBack={() => setStep("done")}
              onSaved={() => {
                outletContext?.reload();
                requestClose();
              }}
              settingsGateway={gatheringSettingsGateway}
              spotGateway={gatheringSpotGateway}
            />
          ) : step === "done" ? (
            <CompetitionCreatedStep
              competitionName={form.name.trim()}
              onClose={requestClose}
              onConfigureGatherings={() => setStep("gatherings")}
            />
          ) : step === "confirm" ? (
            <CompetitionConfirmStep
              isSubmitting={isSubmitting}
              onBack={() => setStep("form")}
              onSubmit={() => void handleCreate()}
              submitError={submitError}
              value={form}
            />
          ) : (
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
          )}
        </div>
      )}
    </FormModal>
  );
}

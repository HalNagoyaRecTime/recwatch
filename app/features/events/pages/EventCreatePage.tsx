import { ArrowRight } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

import { FormModal } from "~/components/ui/modal/FormModal";
import type { EventEditorApi } from "~/features/events/api/event-editor-api";
import { httpEventEditorApi } from "~/features/events/api/http-event-editor-api";
import { EventConfirmStep } from "~/features/events/components/EventConfirmStep";
import { EventCreatedStep } from "~/features/events/components/EventCreatedStep";
import { EventForm } from "~/features/events/components/EventForm";
import { useEventVenueOptions } from "~/features/events/hooks/useEventVenueOptions";
import { getErrorMessage } from "~/lib/client-error";
import type { EventListOutletContext } from "~/features/events/pages/EventListPage";
import {
  emptyEventForm,
  validateEventForm,
} from "~/features/events/model/event-form";

type EventCreatePageProps = {
  api?: EventEditorApi;
};

type Step = "form" | "confirm" | "done";

const stepDescription: Record<Step, string> = {
  form: "まずイベント本体だけを作成します。",
  confirm:
    "この内容で作成します。よろしければ「イベントを作成」を押してください。",
  done: "イベントの作成が完了しました。",
};

/**
 * イベント本体を作成するモーダル。
 * 集合設定は作成後のイベント詳細から行うため、このモーダルでは扱わない。
 */
export function EventCreatePage({
  api = httpEventEditorApi,
}: EventCreatePageProps) {
  const navigate = useNavigate();
  // 一覧の子ルートとして開かれた場合のみ受け取れる。テストなど単体描画時は undefined。
  const outletContext = useOutletContext<EventListOutletContext | undefined>();
  const venueOptions = useEventVenueOptions(api);
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState(emptyEventForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 作成が成功したイベントの ID。閉じたあとの遷移先に使う。
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);

  function handleConfirm() {
    const result = validateEventForm(form);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    setSubmitError(null);
    setStep("confirm");
  }

  async function handleCreate() {
    const result = validateEventForm(form);
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

  // 作成後はどの段階で閉じても、作成したイベントの詳細へ移動する。
  // モーダルは閉じるアニメーション中に onClose が変わると閉じ直すため、関数を固定しておく。
  const closePath =
    createdEventId === null ? "/events" : `/events/${createdEventId}`;
  const handleClose = useCallback(
    () => navigate(closePath),
    [closePath, navigate]
  );

  return (
    <FormModal
      description={stepDescription[step]}
      onClose={handleClose}
      size="xl"
      title="イベントを新規作成"
    >
      {(requestClose) => (
        <div className="space-y-6">
          {step === "done" ? (
            <EventCreatedStep
              eventName={form.name.trim()}
              onClose={requestClose}
            />
          ) : step === "confirm" ? (
            <EventConfirmStep
              isSubmitting={isSubmitting}
              onBack={() => setStep("form")}
              onSubmit={() => void handleCreate()}
              submitError={submitError}
              value={form}
              venueOptions={venueOptions.venues}
            />
          ) : (
            <EventForm
              isDisabled={
                isSubmitting ||
                venueOptions.isLoading ||
                Boolean(venueOptions.loadError)
              }
              isSubmitting={isSubmitting}
              onCancel={requestClose}
              onChange={setForm}
              onSubmit={handleConfirm}
              submitError={venueOptions.loadError ?? submitError}
              submitIcon={ArrowRight}
              submitLabel="確認へ"
              value={form}
              venueOptions={venueOptions.venues}
            />
          )}
        </div>
      )}
    </FormModal>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import type { EventEditorApi } from "~/features/events/api/event-editor-api";
import { httpEventEditorApi } from "~/features/events/api/http-event-editor-api";
import { EventForm } from "~/features/events/components/EventForm";
import { useEventVenueOptions } from "~/features/events/hooks/useEventVenueOptions";
import { getErrorMessage } from "~/lib/client-error";
import {
  emptyEventForm,
  validateEventForm,
} from "~/features/events/model/event-form";

type EventEditPageProps = {
  api?: EventEditorApi;
};

export function EventEditPage({
  api = httpEventEditorApi,
}: EventEditPageProps) {
  const { eventId: eventIdParam } = useParams();
  const navigate = useNavigate();
  const eventId = Number(eventIdParam);
  // 編集はイベント詳細から開くため、保存・キャンセルのどちらでも詳細へ戻す。
  // ID が不正なら詳細も表示できないので一覧へ戻す。
  const detailPath =
    Number.isInteger(eventId) && eventId > 0 ? `/events/${eventId}` : "/events";
  const venueOptions = useEventVenueOptions(api);
  const [form, setForm] = useState(emptyEventForm);
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

    const result = validateEventForm(form);
    if ("error" in result) {
      setSubmitError(result.error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.update(eventId, result.input);
      navigate(detailPath);
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "イベントデータの更新に失敗しました。")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <EventForm
      isDisabled={
        isLoading ||
        isSubmitting ||
        Boolean(loadError) ||
        venueOptions.isLoading ||
        Boolean(venueOptions.loadError)
      }
      isSubmitting={isSubmitting}
      onCancel={() => navigate(detailPath)}
      onChange={setForm}
      onSubmit={() => void handleSubmit()}
      submitError={loadError ?? venueOptions.loadError ?? submitError}
      submitLabel="変更を保存する"
      title="イベントを編集"
      value={form}
      venueOptions={venueOptions.venues}
    />
  );
}

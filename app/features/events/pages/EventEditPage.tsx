import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import type { EventCommandGateway } from "~/features/events/api/contracts/event-command-gateway";
import type { EventQueryGateway } from "~/features/events/api/contracts/event-query-gateway";
import { EventForm } from "~/features/events/components/EventForm";
import { useVenueOptions } from "~/features/events/hooks/useVenueOptions";
import { getErrorMessage } from "~/lib/client-error";
import {
  emptyEventForm,
  toEventFormValue,
  validateEventForm,
} from "~/features/events/model/event-form";
import type { VenueReader } from "~/features/venues/public";

type EventEditPageProps = {
  commandGateway: EventCommandGateway;
  queryGateway: EventQueryGateway;
  venueReader: VenueReader;
};

export function EventEditPage({
  commandGateway,
  queryGateway,
  venueReader,
}: EventEditPageProps) {
  const { eventId: eventIdParam } = useParams();
  const navigate = useNavigate();
  const eventId = Number(eventIdParam);
  // 編集はイベント詳細から開くため、保存・キャンセルのどちらでも詳細へ戻す。
  // ID が不正なら詳細も表示できないので一覧へ戻す。
  const detailPath =
    Number.isInteger(eventId) && eventId > 0 ? `/events/${eventId}` : "/events";
  const venueOptions = useVenueOptions(venueReader);
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
        const value = await queryGateway.get(eventId);
        if (isCurrent) setForm(toEventFormValue(value));
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
  }, [eventId, queryGateway]);

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
      await commandGateway.update(eventId, result.input);
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

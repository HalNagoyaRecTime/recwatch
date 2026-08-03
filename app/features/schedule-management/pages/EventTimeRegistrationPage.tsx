import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { getEventNotificationErrorMessage } from "~/features/event-notification/application/event-notification-error-messages";
import type { EventNotificationGateway } from "~/features/event-notification/application/event-notification-gateway";
import { ScheduleEditorPage } from "~/features/schedule-editor/pages/ScheduleEditorPage";

import { createEventScheduleUpdater } from "../application/create-event-schedule-updater";
import { mapScheduleToDraft } from "../application/map-schedule-to-draft";
import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import type { ManagedSchedule } from "../model/schedule";

type EventTimeRegistrationPageProps = {
  gateway: ScheduleManagementGateway;
  eventNotificationGateway: EventNotificationGateway;
};

export function EventTimeRegistrationPage({
  gateway,
  eventNotificationGateway,
}: EventTimeRegistrationPageProps) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ManagedSchedule[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    gateway
      .list()
      .then((result) => {
        if (active) {
          setEvents(result);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(getEventNotificationErrorMessage(error, "list"));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [gateway]);

  const selectedEvent = events.find((event) => event.id === selectedId);

  if (isLoading) {
    return <p role="status">イベントを読み込んでいます...</p>;
  }

  if (errorMessage) {
    return <p className="text-sm text-red-600">{errorMessage}</p>;
  }

  return (
    <div>
      <div className="mx-auto mb-5 w-full max-w-[1440px]">
        <label htmlFor="registration-event" className="text-sm font-semibold">
          対象イベント<span className="ml-0.5 text-red-500">*</span>
        </label>
        <select
          id="registration-event"
          value={selectedId}
          className="mt-2 h-10 w-full max-w-[420px] rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] px-3 text-sm"
          onChange={(event) => setSelectedId(event.currentTarget.value)}
        >
          <option value="">イベントを選択</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.relatedEventName}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent ? (
        <ScheduleEditorPage
          key={selectedEvent.id}
          submitter={createEventScheduleUpdater(
            selectedEvent,
            eventNotificationGateway
          )}
          initialDraft={mapScheduleToDraft(selectedEvent)}
          mode="edit"
          title="イベント時間登録"
          description="既存イベントの開催時間・開催場所・通知設定を登録します"
          submitLabel="登録する"
          onCancel={() => navigate("/schedule")}
          onSubmitted={() =>
            navigate("/schedule", {
              state: { feedbackMessage: "イベント情報を登録しました。" },
            })
          }
        />
      ) : (
        <div className="mx-auto w-full max-w-[1440px] rounded-lg border border-dashed border-[color:var(--border-2)] p-10 text-center text-sm text-[color:var(--text-3)]">
          登録するイベントを選択してください
        </div>
      )}
    </div>
  );
}

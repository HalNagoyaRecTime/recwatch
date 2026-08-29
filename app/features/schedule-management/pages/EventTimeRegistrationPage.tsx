import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { PageHeader } from "~/components/ui/layout/PageHeader";
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
      .catch(() => {
        if (active) {
          setErrorMessage("イベントを取得できませんでした。");
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

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="スケジュールの新規登録"
        description="既存イベントに開催時間・開催場所・通知設定を追加します"
      />

      {isLoading ? (
        <p role="status" className="text-text-muted mt-6 text-sm">
          イベントを読み込んでいます...
        </p>
      ) : errorMessage ? (
        <p className="text-tone-danger-text mt-6 text-sm">{errorMessage}</p>
      ) : (
        <div className="mt-6">
          <label
            htmlFor="registration-event"
            className="text-text-base text-sm font-semibold"
          >
            対象イベント
            <span className="text-tone-danger-text ml-0.5">*</span>
          </label>
          <select
            id="registration-event"
            value={selectedId}
            className="app-rounded border-border-base bg-surface-base text-text-base mt-2 h-10 w-full max-w-[420px] border px-3 text-sm"
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
      )}

      {!isLoading && !errorMessage && selectedEvent ? (
        <ScheduleEditorPage
          key={selectedEvent.id}
          submitter={createEventScheduleUpdater(
            selectedEvent,
            eventNotificationGateway
          )}
          initialDraft={mapScheduleToDraft(selectedEvent)}
          mode="edit"
          title="スケジュールの新規登録"
          description="既存イベントに開催時間・開催場所・通知設定を追加します"
          submitLabel="登録する"
          showHeader={false}
          onCancel={() => navigate("/schedule")}
          onSubmitted={() =>
            navigate("/schedule", {
              state: { feedbackMessage: "イベント情報を登録しました。" },
            })
          }
        />
      ) : !isLoading && !errorMessage ? (
        <div className="app-rounded border-border-base text-text-muted mt-6 border border-dashed p-10 text-center text-sm">
          対象イベントを選択してください
        </div>
      ) : null}
    </div>
  );
}

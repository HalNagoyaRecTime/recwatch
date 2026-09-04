import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import type { ScheduleSubmitter } from "~/features/schedule-editor/application/schedule-submitter";
import { ScheduleEditorPage } from "~/features/schedule-editor/pages/ScheduleEditorPage";

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import { mapScheduleToDraft } from "../application/map-schedule-to-draft";
import type { ManagedSchedule } from "../model/schedule";

type ScheduleEditEntryPageProps = {
  scheduleId: string;
  gateway: ScheduleManagementGateway;
  createSubmitter: (schedule: ManagedSchedule) => ScheduleSubmitter;
};

export function ScheduleEditEntryPage({
  scheduleId,
  gateway,
  createSubmitter,
}: ScheduleEditEntryPageProps) {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ManagedSchedule | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    gateway
      .get(scheduleId)
      .then((result) => {
        if (active) {
          setSchedule(result);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage("イベントの詳細を取得できませんでした。");
        }
      });

    return () => {
      active = false;
    };
  }, [gateway, scheduleId]);

  if (errorMessage) {
    return (
      <div className="min-h-full space-y-5">
        <PageHeader
          description="イベント情報を読み込めませんでした"
          title="イベント編集"
        />
        <p className="text-tone-danger-text text-sm">{errorMessage}</p>
        <ButtonLink to="/schedule" variant="secondary">
          一覧へ戻る
        </ButtonLink>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-full space-y-5">
        <PageHeader
          description="イベント情報を読み込んでいます"
          title="イベント編集"
        />
        <div
          role="status"
          className="app-rounded border-border-base bg-surface-base text-text-muted border p-10 text-center text-sm"
        >
          イベントを読み込んでいます...
        </div>
      </div>
    );
  }

  return (
    <ScheduleEditorPage
      submitter={createSubmitter(schedule)}
      initialDraft={mapScheduleToDraft(schedule)}
      mode="edit"
      onCancel={() => navigate("/schedule")}
      onSubmitted={() =>
        navigate("/schedule", {
          state: { feedbackMessage: "イベントを更新しました。" },
        })
      }
    />
  );
}

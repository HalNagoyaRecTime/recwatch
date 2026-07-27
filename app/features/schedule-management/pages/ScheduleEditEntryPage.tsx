import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { ScheduleSubmitter } from "~/features/schedule-editor/application/schedule-submitter";
import { ScheduleEditorPage } from "~/features/schedule-editor/pages/ScheduleEditorPage";
import type { ScheduleFormOptions } from "~/features/schedule-editor/model/schedule-option";

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import { mapScheduleToDraft } from "../application/map-schedule-to-draft";
import type { ManagedSchedule } from "../model/schedule";

type ScheduleEditEntryPageProps = {
  scheduleId: string;
  gateway: ScheduleManagementGateway;
  submitter: ScheduleSubmitter;
  options: ScheduleFormOptions;
};

export function ScheduleEditEntryPage({
  scheduleId,
  gateway,
  submitter,
  options,
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
          setErrorMessage("スケジュールの詳細を取得できませんでした。");
        }
      });

    return () => {
      active = false;
    };
  }, [gateway, scheduleId]);

  if (errorMessage) {
    return (
      <div className="mx-auto w-full max-w-[720px]">
        <h1 className="text-xl font-semibold">スケジュール編集</h1>
        <p className="mt-5 text-sm text-[color:var(--tone-red-text)]">
          {errorMessage}
        </p>
        <Link
          to="/schedule"
          className="mt-4 inline-flex h-9 items-center rounded-lg border border-[color:var(--border-2)] px-4 text-sm font-medium"
        >
          一覧へ戻る
        </Link>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div
        role="status"
        className="rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-10 text-center text-sm text-[color:var(--text-3)]"
      >
        スケジュールを読み込んでいます...
      </div>
    );
  }

  return (
    <ScheduleEditorPage
      submitter={submitter}
      options={options}
      initialDraft={mapScheduleToDraft(schedule, options)}
      mode="edit"
      onCancel={() => navigate("/schedule")}
      onSubmitted={() => navigate("/schedule")}
    />
  );
}

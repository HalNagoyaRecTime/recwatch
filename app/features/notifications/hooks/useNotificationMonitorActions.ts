import { useRef, useState } from "react";
import type { NotificationScheduleCommandApi } from "~/features/notifications/api/contracts/notification-schedule-command-api";
import type { NotificationScheduleListItem } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  getMonitorSchedule,
  type MonitorSchedule,
} from "~/features/notifications/hooks/notification-monitor-data";
import {
  reportNotificationActionError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";
import { getErrorMessage } from "~/lib/client-error";

export type MonitorAction = "resend" | "cancel" | "stop";
export const monitorActionLabels: Record<MonitorAction, string> = {
  resend: "再送",
  cancel: "配信予約をキャンセル",
  stop: "緊急停止",
};
export function canRunMonitorAction(
  schedule: NotificationScheduleListItem,
  action: MonitorAction
) {
  if (action === "cancel") return schedule.status === "scheduled";
  if (action === "stop") return schedule.status === "sending";
  return (
    schedule.creation.method === "manual" ||
    (schedule.creation.source.label !== null &&
      schedule.stop?.reason !== "source_deleted")
  );
}

type Options = {
  commandApi?: NotificationScheduleCommandApi;
  items: MonitorSchedule[];
  reload: () => Promise<void>;
  reportFeedback?: NotificationFeedbackReporter;
  now?: () => number;
};
export function useNotificationMonitorActions({
  commandApi,
  items,
  reload,
  reportFeedback,
  now = Date.now,
}: Options) {
  const [target, setTarget] = useState<{
    action: MonitorAction;
    schedule: NotificationScheduleListItem;
  } | null>(null);
  const [timing, setTiming] = useState<"immediate" | "scheduled">("immediate");
  const [sendAt, setSendAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pending = useRef(false);
  const current =
    target &&
    items.find(
      (item) =>
        item.summary.notificationScheduleId ===
        target.schedule.notificationScheduleId
    );
  const schedule = current ? getMonitorSchedule(current) : null;
  const canSubmit = Boolean(
    commandApi &&
    target &&
    schedule &&
    canRunMonitorAction(schedule, target.action)
  );
  function open(schedule: NotificationScheduleListItem, action: MonitorAction) {
    if (
      !commandApi ||
      pending.current ||
      !canRunMonitorAction(schedule, action)
    )
      return;
    setTarget({ action, schedule });
    setTiming("immediate");
    setSendAt("");
    setError(null);
  }
  function close() {
    if (!pending.current) setTarget(null);
  }
  async function submit() {
    if (!target || !commandApi || pending.current) return;
    if (!canSubmit) {
      setError(
        "現在の配信状態では操作できません。最新状態を確認してください。"
      );
      return;
    }
    const timestamp = Date.parse(sendAt);
    if (
      target.action === "resend" &&
      timing === "scheduled" &&
      (!Number.isFinite(timestamp) || timestamp <= now())
    ) {
      setError("未来の配信日時を指定してください。");
      return;
    }
    const id = target.schedule.notificationScheduleId;
    const action = target.action;
    pending.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      if (action === "resend")
        await commandApi.resend(id, {
          delivery:
            timing === "immediate"
              ? { type: "immediate", sendAt: null }
              : {
                  type: "scheduled",
                  sendAt: new Date(timestamp).toISOString(),
                },
        });
      else if (action === "cancel") await commandApi.cancel(id);
      else await commandApi.stop(id);
      await reload();
      setTarget(null);
      reportFeedback?.({
        kind: "action-success",
        title: `${monitorActionLabels[action]}しました`,
        message: `Schedule #${id}の最新情報を再取得しました。`,
      });
    } catch (cause) {
      await reload();
      const message = getErrorMessage(cause);
      setError(message);
      reportNotificationActionError(reportFeedback, {
        title: `${monitorActionLabels[action]}できませんでした`,
        message,
        action: `notification.schedule.${action}`,
        endpoint: `/api/v1/admin/notifications/schedules/${id}${action === "cancel" ? "" : `/${action}`}`,
        error: cause,
      });
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  }
  return {
    target,
    schedule,
    timing,
    setTiming,
    sendAt,
    setSendAt,
    error,
    isSubmitting,
    canSubmit,
    open,
    close,
    submit,
  };
}

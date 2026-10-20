import { useRef, useState } from "react";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationDetail } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationScheduleCommandApi } from "~/features/notifications/api/contracts/notification-schedule-command-api";
import { canDeleteNotification } from "~/features/notifications/hooks/notification-list-data";
import {
  reportNotificationActionError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";
import { getErrorMessage } from "~/lib/client-error";

type Target = { type: "notification" } | { type: "schedule"; id: number };
export function useNotificationRemoval({
  notification,
  commandApi,
  scheduleCommandApi,
  reload,
  onDeleted,
  reportFeedback,
}: {
  notification: AdminNotificationDetail | null;
  commandApi?: AdminNotificationCommandApi;
  scheduleCommandApi?: NotificationScheduleCommandApi;
  reload: () => Promise<void>;
  onDeleted: () => void;
  reportFeedback?: NotificationFeedbackReporter;
}) {
  const [target, setTarget] = useState<Target | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pending = useRef(false);
  const canDelete = Boolean(
    commandApi && notification && canDeleteNotification(notification)
  );
  const canCancel = (id: number) =>
    Boolean(
      scheduleCommandApi &&
      notification?.schedules.some(
        (schedule) =>
          schedule.notificationScheduleId === id &&
          schedule.status === "scheduled"
      )
    );
  function request(next: Target) {
    if (
      pending.current ||
      (next.type === "notification" ? !canDelete : !canCancel(next.id))
    )
      return;
    setErrorMessage(null);
    setTarget(next);
  }
  async function confirm() {
    if (!notification || !target || pending.current) return;
    if (target.type === "notification" ? !canDelete : !canCancel(target.id)) {
      setTarget(null);
      return;
    }
    const current = target;
    const id =
      current.type === "notification"
        ? notification.notificationId
        : current.id;
    pending.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (current.type === "notification") await commandApi!.delete(id);
      else await scheduleCommandApi!.cancel(id);
      setTarget(null);
      reportFeedback?.({
        kind: "action-success",
        title:
          current.type === "notification"
            ? "通知を削除しました"
            : "配信予約をキャンセルしました",
        message:
          current.type === "notification"
            ? `通知 #${id}を削除しました。`
            : `Schedule #${id}の予約を取り消しました。`,
      });
      if (current.type === "notification") onDeleted();
      else await reload();
    } catch (error) {
      setTarget(null);
      // 404・409を含め失敗後はBackendの状態を再取得します。
      await reload();
      const message = getErrorMessage(error);
      setErrorMessage(message);
      reportNotificationActionError(reportFeedback, {
        title:
          current.type === "notification"
            ? "通知を削除できませんでした"
            : "配信予約をキャンセルできませんでした",
        message,
        action:
          current.type === "notification"
            ? "notification.delete"
            : "notification.schedule.cancel",
        endpoint:
          current.type === "notification"
            ? `/api/v1/admin/notifications/${id}`
            : `/api/v1/admin/notifications/schedules/${id}`,
        error,
      });
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  }
  return {
    target,
    isSubmitting,
    errorMessage,
    canDelete,
    canCancel,
    request,
    confirm,
    close: () => {
      if (!pending.current) setTarget(null);
    },
  };
}

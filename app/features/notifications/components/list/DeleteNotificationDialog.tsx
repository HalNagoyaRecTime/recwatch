import { AlertTriangleIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button/Button";
import type { AdminNotificationListItem } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { useDocumentScrollLock } from "~/hooks/useDocumentScrollLock";

type DeleteNotificationDialogProps = {
  notification: AdminNotificationListItem;
  isSubmitting: boolean;
  scheduleId?: number;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteNotificationDialog({
  notification,
  scheduleId,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteNotificationDialogProps) {
  useDocumentScrollLock(true);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSubmitting, onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-notification-title"
        aria-describedby="delete-notification-description"
        className="app-rounded border-border-base bg-surface-base shadow-soft w-full max-w-[420px] border p-5"
      >
        <div className="flex items-start gap-3">
          <span className="bg-tone-danger-surface text-tone-danger-text inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <AlertTriangleIcon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="delete-notification-title" className="font-semibold">
              {scheduleId
                ? "配信予約をキャンセルしますか？"
                : "この未送信通知を削除しますか？"}
            </h2>
            <p
              id="delete-notification-description"
              className="text-text-muted mt-2 text-sm leading-6"
            >
              通知 #{notification.notificationId}「
              {notification.content.push.title}」
              {scheduleId
                ? `のSchedule #${scheduleId}の配信予約を取り消します。通知本体は削除しません。`
                : "を削除します。この操作は元に戻せません。"}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            autoFocus
            disabled={isSubmitting}
            onClick={onClose}
            size="md"
            variant="secondary"
          >
            戻る
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={onConfirm}
            size="md"
            variant="danger"
          >
            {isSubmitting
              ? "処理中..."
              : scheduleId
                ? "配信予約をキャンセル"
                : "削除する"}
          </Button>
        </div>
      </div>
    </div>
  );
}

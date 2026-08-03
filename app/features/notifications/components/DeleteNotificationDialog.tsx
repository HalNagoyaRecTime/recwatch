import { AlertTriangleIcon } from "lucide-react";
import { useEffect } from "react";

import type { ManagedNotification } from "~/features/notifications/model/managed-notification";

type DeleteNotificationDialogProps = {
  notification: ManagedNotification;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteNotificationDialog({
  notification,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteNotificationDialogProps) {
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
        className="w-full max-w-[420px] rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-5 shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--tone-red-bg)] text-[color:var(--tone-red-text)]">
            <AlertTriangleIcon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="delete-notification-title" className="font-semibold">
              この未送信通知を削除しますか？
            </h2>
            <p
              id="delete-notification-description"
              className="mt-2 text-sm leading-6 text-[color:var(--text-2)]"
            >
              「{notification.title}
              」は配信されず、一覧から削除されます。この操作は元に戻せません。
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            disabled={isSubmitting}
            className="h-9 rounded-lg border border-[color:var(--border-2)] px-4 text-sm font-medium transition hover:bg-[color:var(--surface-2)] disabled:opacity-50"
            onClick={onClose}
          >
            戻る
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            className="h-9 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
          >
            {isSubmitting ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}

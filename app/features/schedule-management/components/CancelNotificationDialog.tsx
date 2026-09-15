import { AlertTriangleIcon } from "lucide-react";
import { useEffect } from "react";

import type { ManagedSchedule } from "../model/schedule";

type CancelNotificationDialogProps = {
  schedule: ManagedSchedule;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CancelNotificationDialog({
  schedule,
  isSubmitting,
  onClose,
  onConfirm,
}: CancelNotificationDialogProps) {
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
      role="presentation"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-schedule-title"
        aria-describedby="delete-schedule-description"
        className="border-border-strong bg-surface-base shadow-soft w-full max-w-[440px] rounded-lg border p-5"
      >
        <div className="flex items-start gap-3">
          <span className="bg-tone-danger-bg text-tone-danger-text inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <AlertTriangleIcon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="delete-schedule-title" className="font-semibold">
              この通知予定を削除しますか？
            </h2>
            <p
              id="delete-schedule-description"
              className="text-text-muted mt-2 text-sm leading-6"
            >
              {schedule.relatedEventName || "名称未設定"}の未送信通知を
              削除します。イベント情報は削除されません。
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            disabled={isSubmitting}
            className="border-border-strong hover:bg-surface-hover h-9 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"
            onClick={onClose}
          >
            戻る
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            className="h-9 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
          >
            {isSubmitting ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}

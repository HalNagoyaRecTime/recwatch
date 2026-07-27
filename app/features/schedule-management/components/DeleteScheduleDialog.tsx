import { AlertTriangleIcon } from "lucide-react";
import { useEffect } from "react";

import {
  managedScheduleTypeLabels,
  type ManagedSchedule,
} from "../model/schedule";

type DeleteScheduleDialogProps = {
  schedule: ManagedSchedule;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteScheduleDialog({
  schedule,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteScheduleDialogProps) {
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
        className="w-full max-w-[440px] rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-5 shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--tone-red-bg)] text-[color:var(--tone-red-text)]">
            <AlertTriangleIcon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="delete-schedule-title" className="font-semibold">
              このスケジュールを削除しますか？
            </h2>
            <p
              id="delete-schedule-description"
              className="mt-2 text-sm leading-6 text-[color:var(--text-2)]"
            >
              {managedScheduleTypeLabels[schedule.type]}（{schedule.startTime}〜
              {schedule.endTime}）を削除します。関連する未送信通知の扱いは
              Backend側で判定されます。
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            disabled={isSubmitting}
            className="h-9 rounded-lg border border-[color:var(--border-2)] px-4 text-sm font-medium hover:bg-[color:var(--surface-2)] disabled:opacity-50"
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

import { BellIcon, BellOffIcon, XIcon } from "lucide-react";
import { useEffect } from "react";

import type { ManagedSchedule } from "../model/schedule";
import { SchedulePublicationLabel } from "./SchedulePublicationLabel";

type ScheduleDetailDialogProps = {
  schedule: ManagedSchedule;
  onClose: () => void;
};

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-[color:var(--text-3)]">{label}</dt>
      <dd className="mt-1 text-sm text-[color:var(--text-1)]">{children}</dd>
    </div>
  );
}

export function ScheduleDetailDialog({
  schedule,
  onClose,
}: ScheduleDetailDialogProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        className="w-full max-w-[560px] rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] shadow-[var(--shadow-soft)]"
      >
        <header className="flex items-center justify-between border-b border-[color:var(--border-1)] px-5 py-4">
          <div>
            <h2 id="event-detail-title" className="font-semibold">
              イベント詳細
            </h2>
            <p className="mt-1 text-xs text-[color:var(--text-3)]">
              {schedule.relatedEventName || "名称未設定"}・{schedule.startTime}
              〜{schedule.endTime}
            </p>
          </div>
          <button
            type="button"
            autoFocus
            aria-label="詳細を閉じる"
            title="閉じる"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--text-3)] hover:bg-[color:var(--surface-2)]"
            onClick={onClose}
          >
            <XIcon size={17} aria-hidden="true" />
          </button>
        </header>

        <dl className="grid gap-x-6 gap-y-5 px-5 py-5 sm:grid-cols-2">
          <DetailItem label="イベント名">
            {schedule.relatedEventName || "—"}
          </DetailItem>
          <DetailItem label="開催時間">
            {schedule.startTime}〜{schedule.endTime}
          </DetailItem>
          <DetailItem label="開催場所">{schedule.venueName || "—"}</DetailItem>
          <DetailItem label="予約投稿">
            <SchedulePublicationLabel publication={schedule.publication} />
          </DetailItem>
          <DetailItem label="通知">
            <span className="inline-flex items-center gap-1.5">
              {schedule.notificationEnabled ? (
                <BellIcon size={14} aria-hidden="true" />
              ) : (
                <BellOffIcon size={14} aria-hidden="true" />
              )}
              {schedule.notificationEnabled ? "通知あり" : "通知なし"}
            </span>
          </DetailItem>
          <div className="sm:col-span-2">
            <DetailItem label="備考">{schedule.notes || "—"}</DetailItem>
          </div>
        </dl>

        <footer className="flex justify-end gap-2 border-t border-[color:var(--border-1)] px-5 py-4">
          <button
            type="button"
            className="h-9 rounded-lg border border-[color:var(--border-2)] px-4 text-sm font-medium hover:bg-[color:var(--surface-2)]"
            onClick={onClose}
          >
            閉じる
          </button>
        </footer>
      </section>
    </div>
  );
}

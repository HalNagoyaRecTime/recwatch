import { Trash2Icon } from "lucide-react";

import type { NotificationSchedule } from "../model/notification-schedule";
import { NotificationStatusBadge } from "./NotificationStatusBadge";

type NotificationScheduleTableProps = {
  schedules: NotificationSchedule[];
  onCancel: (schedule: NotificationSchedule) => void;
};

function formatScheduledAt(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function fallback(value: string | null) {
  return value || "-";
}

export function NotificationScheduleTable({
  schedules,
  onCancel,
}: NotificationScheduleTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)]">
      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
        <thead className="bg-[color:var(--surface-2)] text-xs text-[color:var(--text-2)]">
          <tr>
            <th className="w-[300px] px-4 py-3 font-medium">件名 / 本文</th>
            <th className="px-3 py-3 font-medium">配信対象</th>
            <th className="px-3 py-3 font-medium">配信日時</th>
            <th className="px-3 py-3 font-medium">作成・配信者</th>
            <th className="px-3 py-3 font-medium">関連競技</th>
            <th className="px-3 py-3 font-medium">関連スケジュール</th>
            <th className="px-3 py-3 font-medium">状態</th>
            <th className="w-28 px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr
              key={schedule.id}
              className="border-t border-[color:var(--border-1)] align-top"
            >
              <td className="px-4 py-3">
                <div className="font-semibold text-[color:var(--text-1)]">
                  {schedule.title}
                </div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-[color:var(--text-3)]">
                  {schedule.body}
                </div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {schedule.audienceName}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {formatScheduledAt(schedule.scheduledAt)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {schedule.creatorName}
              </td>
              <td className="px-3 py-3">
                {fallback(schedule.relatedEventName)}
              </td>
              <td className="px-3 py-3">
                {fallback(schedule.relatedScheduleName)}
              </td>
              <td className="px-3 py-3">
                <NotificationStatusBadge status={schedule.status} />
              </td>
              <td className="px-4 py-3 text-right">
                {schedule.status === "draft" ? (
                  <button
                    type="button"
                    aria-label={`「${schedule.title}」をキャンセル`}
                    title="通知予定をキャンセル"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--text-3)] transition hover:bg-[color:var(--tone-red-bg)] hover:text-[color:var(--tone-red-text)]"
                    onClick={() => onCancel(schedule)}
                  >
                    <Trash2Icon size={15} aria-hidden="true" />
                  </button>
                ) : (
                  <span className="text-xs text-[color:var(--text-3)]">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

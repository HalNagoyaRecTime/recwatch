import { EllipsisIcon, EyeIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import type { ManagedSchedule } from "../model/schedule";
import { SchedulePublicationLabel } from "./SchedulePublicationLabel";

type ScheduleManagementTableProps = {
  schedules: ManagedSchedule[];
  onShowDetail: (schedule: ManagedSchedule) => void;
  onCancelNotification: (schedule: ManagedSchedule) => void;
};

function fallback(value: string | null) {
  return value || "—";
}

export function ScheduleManagementTable({
  schedules,
  onShowDetail,
  onCancelNotification,
}: ScheduleManagementTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) {
      return;
    }

    function closeMenu(event: MouseEvent) {
      const target = event.target;
      if (
        target instanceof Element &&
        !target.closest(`[data-schedule-menu="${openMenuId}"]`)
      ) {
        setOpenMenuId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId]);

  return (
    <div className="overflow-x-auto rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)]">
      <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
        <thead className="bg-[color:var(--surface-2)] text-xs text-[color:var(--text-2)]">
          <tr>
            <th className="px-4 py-3 font-medium">イベント名</th>
            <th className="px-3 py-3 font-medium">開催時間</th>
            <th className="px-3 py-3 font-medium">開催場所</th>
            <th className="w-[220px] px-3 py-3 font-medium">備考</th>
            <th className="px-3 py-3 font-medium">予約投稿</th>
            <th className="w-20 px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr
              key={schedule.id}
              className="border-t border-[color:var(--border-1)] transition hover:bg-[color:var(--surface-2)]"
            >
              <td className="px-4 py-3 font-medium">
                <button
                  type="button"
                  className="text-left hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-1)]"
                  onClick={() => onShowDetail(schedule)}
                >
                  {fallback(schedule.relatedEventName)}
                </button>
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {schedule.startTime}〜{schedule.endTime}
              </td>
              <td
                className={`px-3 py-3 ${schedule.venueName ? "" : "text-[color:var(--text-3)]"}`}
              >
                {fallback(schedule.venueName)}
              </td>
              <td
                className={`max-w-[220px] truncate px-3 py-3 ${schedule.notes ? "" : "text-[color:var(--text-3)]"}`}
                title={schedule.notes ?? undefined}
              >
                {fallback(schedule.notes)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <SchedulePublicationLabel publication={schedule.publication} />
              </td>
              <td className="px-4 py-3 text-right">
                <div
                  className="relative inline-block text-left"
                  data-schedule-menu={schedule.id}
                >
                  <button
                    type="button"
                    aria-label={`${schedule.relatedEventName || schedule.startTime}のイベント操作`}
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === schedule.id}
                    title="操作"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--text-2)] transition hover:bg-[color:var(--surface-2)]"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === schedule.id ? null : schedule.id
                      )
                    }
                  >
                    <EllipsisIcon size={18} aria-hidden="true" />
                  </button>
                  {openMenuId === schedule.id ? (
                    <div
                      role="menu"
                      className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-1 shadow-[var(--shadow-soft)]"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm hover:bg-[color:var(--surface-2)]"
                        onClick={() => {
                          setOpenMenuId(null);
                          onShowDetail(schedule);
                        }}
                      >
                        <EyeIcon size={14} aria-hidden="true" />
                        詳細
                      </button>
                      {schedule.notificationEnabled ? (
                        <button
                          type="button"
                          role="menuitem"
                          className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-[color:var(--tone-red-text)] hover:bg-[color:var(--tone-red-bg)]"
                          onClick={() => {
                            setOpenMenuId(null);
                            onCancelNotification(schedule);
                          }}
                        >
                          <Trash2Icon size={14} aria-hidden="true" />
                          通知を削除
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

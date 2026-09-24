import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button/Button";
import type { AdminNotificationListItem } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { formatNotificationTime } from "~/features/notifications/components/list/notification-display";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

type NotificationCalendarProps = {
  items: readonly AdminNotificationListItem[];
  month: Date;
  onMonthChange: (month: Date) => void;
};

export function NotificationCalendar({
  items,
  month,
  onMonthChange,
}: NotificationCalendarProps) {
  const days = buildCalendarDays(month);
  const schedules = groupSchedulesByDate(items);
  const monthLabel = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
  }).format(month);

  return (
    <section
      aria-label={`${monthLabel}の通知カレンダー`}
      className="border-border-base bg-surface-base app-rounded overflow-hidden border"
    >
      <div className="border-border-base flex items-center justify-between border-b px-4 py-3">
        <Button
          aria-label="前の月"
          icon={ChevronLeft}
          iconOnly
          onClick={() => onMonthChange(moveMonth(month, -1))}
          size="sm"
          variant="ghost"
        />
        <h2 className="font-semibold">{monthLabel}</h2>
        <Button
          aria-label="次の月"
          icon={ChevronRight}
          iconOnly
          onClick={() => onMonthChange(moveMonth(month, 1))}
          size="sm"
          variant="ghost"
        />
      </div>
      <div className="grid grid-cols-7" role="grid">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-border-base text-text-muted border-b px-2 py-2 text-center text-xs font-medium"
            role="columnheader"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = toLocalDateKey(day);
          const daySchedules = schedules.get(dateKey) ?? [];
          const outsideMonth = day.getMonth() !== month.getMonth();
          return (
            <div
              key={dateKey}
              aria-label={new Intl.DateTimeFormat("ja-JP", {
                month: "long",
                day: "numeric",
              }).format(day)}
              className="border-border-base min-h-32 border-r border-b p-2 last:border-r-0"
              role="gridcell"
            >
              <span
                className={`text-xs font-medium ${outsideMonth ? "text-text-subtle" : "text-text-base"}`}
              >
                {day.getDate()}
              </span>
              <div className="mt-2 flex flex-col gap-2">
                {daySchedules.map(({ notification, schedule }) => (
                  <Link
                    key={schedule.notificationScheduleId}
                    aria-label={`${formatNotificationTime(schedule.sendAt)} ${notification.content.push.title}の詳細を表示`}
                    className="border-border-base bg-surface-muted app-rounded flex min-w-0 flex-col gap-1 border p-2 hover:shadow-sm"
                    to={`/notifications/${notification.notificationId}`}
                  >
                    <span className="text-text-muted text-xs">
                      {formatNotificationTime(schedule.sendAt)}
                    </span>
                    <span className="truncate text-xs font-medium">
                      {notification.content.push.title}
                    </span>
                    <NotificationStatusBadge status={schedule.status} />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {schedules.size === 0 ? (
        <p className="text-text-muted px-4 py-6 text-center text-sm">
          この月に配信予定・配信済みの通知はありません
        </p>
      ) : null}
    </section>
  );
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days: Date[] = [];
  for (
    const day = new Date(start);
    day <= end;
    day.setDate(day.getDate() + 1)
  ) {
    days.push(new Date(day));
  }
  return days;
}

function groupSchedulesByDate(items: readonly AdminNotificationListItem[]) {
  const grouped = new Map<
    string,
    Array<{
      notification: AdminNotificationListItem;
      schedule: AdminNotificationListItem["schedules"][number];
    }>
  >();

  for (const notification of items) {
    for (const schedule of notification.schedules) {
      const date = new Date(schedule.sendAt);
      if (Number.isNaN(date.getTime())) continue;
      const key = toLocalDateKey(date);
      const entries = grouped.get(key) ?? [];
      entries.push({ notification, schedule });
      entries.sort(
        (left, right) =>
          Date.parse(left.schedule.sendAt) - Date.parse(right.schedule.sendAt)
      );
      grouped.set(key, entries);
    }
  }
  return grouped;
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function moveMonth(month: Date, amount: number) {
  return new Date(month.getFullYear(), month.getMonth() + amount, 1);
}

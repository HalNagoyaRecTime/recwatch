import FullCalendar, {
  type CalendarRef,
  type DatesSetInfo,
  type EventDisplayInfo,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/classic";
import jaLocale from "@fullcalendar/react/locales/ja";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button/Button";
import type {
  AdminNotificationListItem,
  AdminNotificationListQuery,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  formatNotificationTime,
  notificationScheduleStatusLabels,
} from "~/features/notifications/components/list/notification-display";
import "./notification-calendar.css";

type Schedule = AdminNotificationListItem["schedules"][number];
type Entry = { notification: AdminNotificationListItem; schedule: Schedule };
type Props = {
  items: readonly AdminNotificationListItem[];
  month: Date;
  filters: ReactNode;
  isLoading: boolean;
  onRangeChange: (range: AdminNotificationListQuery) => void;
  showEmptyState: boolean;
};
const plugins = [themePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin];
const colors: Record<Schedule["status"], string> = {
  scheduled: "#94a3b8",
  resolving: "#f59e0b",
  sending: "#2d95d3",
  completed: "#16a34a",
  failed: "#ef4444",
  stopped: "#64748b",
};
const jstDate = (value: Date | string) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
    new Date(value)
  );

export function NotificationCalendar({
  items,
  month,
  filters,
  isLoading,
  onRangeChange,
  showEmptyState,
}: Props) {
  const calendarRef = useRef<CalendarRef>(null);
  const rangeRef = useRef("");
  const [title, setTitle] = useState("");
  const [view, setView] = useState("dayGridMonth");
  const [visibleRange, setVisibleRange] = useState<{
    from: string;
    to: string;
  }>();
  const today = jstDate(new Date());
  const entries: Entry[] = items.flatMap((notification) =>
    notification.schedules.map((schedule) => ({ notification, schedule }))
  );
  const todayEntries = entries
    .filter(({ schedule }) => jstDate(schedule.sendAt) === today)
    .sort(
      (a, b) => Date.parse(a.schedule.sendAt) - Date.parse(b.schedule.sendAt)
    );
  const events = entries.map(({ notification, schedule }) => ({
    id: String(schedule.notificationScheduleId),
    title: notification.content.push.title,
    start: schedule.sendAt,
    url: `/notifications/${notification.notificationId}`,
    extendedProps: {
      status: schedule.status,
      method: notification.creation.method,
      sendAt: schedule.sendAt,
    },
  }));
  const onDatesSet = (info: DatesSetInfo) => {
    setTitle(info.view.title);
    setView(info.view.type);
    const from = info.start.toISOString();
    const to = new Date(info.end.getTime() - 1).toISOString();
    const key = `${from}/${to}`;
    if (rangeRef.current !== key) {
      rangeRef.current = key;
      setVisibleRange({ from, to });
      onRangeChange({ from, to });
    }
  };
  const eventContent = (info: EventDisplayInfo) => {
    const status = info.event.extendedProps.status as Schedule["status"];
    return (
      <div className="text-text-base flex min-w-0 items-start gap-[0.4rem] p-[0.35rem]">
        <span
          className="mt-[0.3rem] inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: colors[status] }}
        />
        <span className="min-w-0 flex-1">
          <strong className="block truncate">
            {formatNotificationTime(info.event.extendedProps.sendAt as string)}{" "}
            {info.event.title}
          </strong>
          <small className="text-text-muted block truncate text-[0.65rem]">
            {notificationScheduleStatusLabels[status]}・
            {info.event.extendedProps.method === "manual" ? "手動" : "自動"}
          </small>
        </span>
        {info.event.extendedProps.method === "automatic" ? (
          <LockKeyhole aria-label="自動通知" size={12} />
        ) : null}
      </div>
    );
  };
  const withinRange =
    visibleRange &&
    today >= jstDate(visibleRange.from) &&
    today <= jstDate(visibleRange.to);
  return (
    <section
      aria-label="通知カレンダー"
      className="notification-calendar-theme text-text-base"
    >
      <div className="border-border-base bg-surface-base flex flex-wrap items-center gap-2 rounded-xl border p-3">
        <Button
          aria-label="前の期間"
          icon={ChevronLeft}
          iconOnly
          onClick={() => calendarRef.current?.getApi().prev()}
          size="sm"
          variant="secondary"
        />
        <strong className="min-w-32 text-center">{title}</strong>
        <Button
          aria-label="次の期間"
          icon={ChevronRight}
          iconOnly
          onClick={() => calendarRef.current?.getApi().next()}
          size="sm"
          variant="secondary"
        />
        <Button
          onClick={() => calendarRef.current?.getApi().today()}
          size="sm"
          variant="secondary"
        >
          今日
        </Button>
        <div
          className="border-border-base inline-flex overflow-hidden rounded-[0.45rem] border"
          role="group"
          aria-label="カレンダーの表示期間"
        >
          {[
            ["dayGridMonth", "月"],
            ["timeGridWeek", "週"],
            ["timeGridDay", "日"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              className="border-border-base bg-surface-base text-text-muted aria-pressed:bg-text-base aria-pressed:text-surface-base h-8 min-w-8 px-[0.45rem] text-xs font-medium [&+button]:border-l"
              onClick={() => calendarRef.current?.getApi().changeView(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {filters}
        </div>
      </div>
      <div className="mt-4 grid items-start gap-4 min-[851px]:grid-cols-[minmax(0,1fr)_280px]">
        <div
          className="border-border-base bg-surface-base relative overflow-hidden rounded-xl border max-[850px]:overflow-x-auto"
          aria-busy={isLoading}
        >
          {isLoading && (
            <div
              className="border-border-base bg-surface-base text-text-muted pointer-events-none absolute top-2 right-2 z-[5] flex items-center gap-[0.4rem] rounded-md border px-[0.65rem] py-[0.4rem] text-xs"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle
                aria-hidden="true"
                className="motion-safe:animate-spin"
                size={14}
              />
              カレンダーを読み込み中です
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            className="text-[0.78rem] max-[850px]:min-w-[650px]"
            plugins={plugins}
            initialView="dayGridMonth"
            initialDate={month}
            locale={jaLocale}
            timeZone="Asia/Tokyo"
            headerToolbar={false}
            datesSet={onDatesSet}
            events={events}
            eventContent={eventContent}
            eventClass="!border !border-border-base !rounded-[0.4rem] !bg-surface-base !text-text-base"
            dayCellClass="min-h-[145px]"
            dayHeaderClass="!bg-surface-muted !text-text-muted !font-semibold"
            dayCellTopClass="!justify-start !p-[0.4rem] !text-text-muted !font-semibold"
            dayCellTopContent={(info) => (
              <span
                className={
                  info.isToday
                    ? "bg-text-base text-surface-base inline-grid h-6 min-w-6 place-items-center rounded-full"
                    : undefined
                }
              >
                {info.dayNumberText.replace(/日$/, "")}
              </span>
            )}
            dayMaxEvents={4}
            height="auto"
            fixedWeekCount={false}
            firstDay={0}
          />
          {showEmptyState && entries.length === 0 ? (
            <p className="text-text-muted p-4 text-center text-sm">
              この期間に表示する通知はありません
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-4">
          <aside className="border-border-base bg-surface-base overflow-hidden rounded-xl border p-4">
            <h2 className="font-bold">本日の配信</h2>
            <p className="text-text-muted mt-[0.3rem] text-xs">
              {new Intl.DateTimeFormat("ja-JP", {
                timeZone: "Asia/Tokyo",
                month: "long",
                day: "numeric",
                weekday: "short",
              }).format(new Date())}
            </p>
            {withinRange ? (
              <>
                <div className="my-4 grid grid-cols-4 gap-[0.3rem]">
                  {(
                    [
                      ["scheduled", "予定"],
                      ["sending", "処理中"],
                      ["failed", "失敗"],
                      ["completed", "完了"],
                    ] as const
                  ).map(([status, label]) => (
                    <div
                      key={status}
                      className="bg-surface-muted flex flex-col items-center gap-[0.4rem] rounded-md px-[0.2rem] py-[0.7rem]"
                    >
                      <strong>
                        {
                          todayEntries.filter(
                            (entry) => entry.schedule.status === status
                          ).length
                        }
                      </strong>
                      <small className="text-text-muted text-[0.65rem]">
                        {label}
                      </small>
                    </div>
                  ))}
                </div>
                <div
                  className="flex max-h-80 flex-col gap-4 overflow-y-auto overscroll-contain"
                  role="region"
                  aria-label="本日の配信一覧"
                  tabIndex={0}
                >
                  {todayEntries.length ? (
                    todayEntries.map(({ notification, schedule }) => (
                      <Link
                        key={schedule.notificationScheduleId}
                        to={`/notifications/${notification.notificationId}`}
                        className="flex items-baseline gap-2 text-xs"
                      >
                        <time className="text-text-muted">
                          {formatNotificationTime(schedule.sendAt)}
                        </time>
                        <i
                          className="inline-block size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: colors[schedule.status] }}
                        />
                        <span>
                          <strong className="block">
                            {notification.content.push.title}
                          </strong>
                          <small className="text-text-muted block text-[0.65rem]">
                            {notificationScheduleStatusLabels[schedule.status]}
                            ・
                            {notification.creation.method === "manual"
                              ? "手動"
                              : "自動"}
                          </small>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-text-muted mt-[0.3rem] text-xs">
                      本日の配信はありません
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-text-muted mt-[0.3rem] text-xs">
                今日を表示すると配信を確認できます
              </p>
            )}
          </aside>
          <section
            className="border-border-base bg-surface-base overflow-hidden rounded-xl border p-4"
            aria-labelledby="notification-calendar-status-heading"
          >
            <h2 id="notification-calendar-status-heading" className="font-bold">
              状態
            </h2>
            <div className="text-text-muted flex flex-wrap items-center gap-4 pt-[0.8rem] text-xs">
              {(
                [
                  ["scheduled", "配信予定"],
                  ["sending", "処理中"],
                  ["completed", "配信完了"],
                  ["resolving", "対象者確定中"],
                  ["failed", "失敗"],
                  ["stopped", "停止"],
                ] as const
              ).map(([status, label]) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-[0.35rem]"
                >
                  <i
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[status] }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

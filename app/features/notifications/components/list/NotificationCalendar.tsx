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
      <div className="notification-calendar-event">
        <span
          className="notification-calendar-dot"
          style={{ backgroundColor: colors[status] }}
        />
        <span className="notification-calendar-event-body">
          <strong>
            {formatNotificationTime(info.event.extendedProps.sendAt as string)}{" "}
            {info.event.title}
          </strong>
          <small>
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
      className="notification-calendar-shell"
    >
      <div className="notification-calendar-toolbar">
        <Button
          aria-label="前の期間"
          icon={ChevronLeft}
          iconOnly
          onClick={() => calendarRef.current?.getApi().prev()}
          size="sm"
          variant="secondary"
        />
        <strong className="notification-calendar-title">{title}</strong>
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
          className="notification-calendar-views"
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
              className="notification-calendar-view"
              onClick={() => calendarRef.current?.getApi().changeView(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="notification-calendar-toolbar-end">{filters}</div>
      </div>
      <div className="notification-calendar-layout">
        <div className="notification-calendar-main" aria-busy={isLoading}>
          {isLoading && (
            <div
              className="notification-calendar-loading"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle
                aria-hidden="true"
                className="notification-calendar-loading-icon"
                size={14}
              />
              カレンダーを読み込み中です
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            className="notification-calendar-widget"
            plugins={plugins}
            initialView="dayGridMonth"
            initialDate={month}
            locale={jaLocale}
            timeZone="Asia/Tokyo"
            headerToolbar={false}
            datesSet={onDatesSet}
            events={events}
            eventContent={eventContent}
            eventClass="notification-calendar-event-outer"
            dayCellClass="notification-calendar-day"
            dayHeaderClass="notification-calendar-day-header"
            dayCellTopClass="notification-calendar-day-top"
            dayCellTopContent={(info) => (
              <span
                className={
                  info.isToday ? "notification-calendar-today" : undefined
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
            <p className="notification-calendar-empty">
              この期間に表示する通知はありません
            </p>
          ) : null}
        </div>
        <div className="notification-calendar-side-column">
          <aside className="notification-calendar-sidebar">
            <h2>本日の配信</h2>
            <p>
              {new Intl.DateTimeFormat("ja-JP", {
                timeZone: "Asia/Tokyo",
                month: "long",
                day: "numeric",
                weekday: "short",
              }).format(new Date())}
            </p>
            {withinRange ? (
              <>
                <div className="notification-calendar-counts">
                  {(
                    [
                      ["scheduled", "予定"],
                      ["sending", "処理中"],
                      ["failed", "失敗"],
                      ["completed", "完了"],
                    ] as const
                  ).map(([status, label]) => (
                    <div key={status}>
                      <strong>
                        {
                          todayEntries.filter(
                            (entry) => entry.schedule.status === status
                          ).length
                        }
                      </strong>
                      <small>{label}</small>
                    </div>
                  ))}
                </div>
                <div
                  className="notification-calendar-agenda"
                  role="region"
                  aria-label="本日の配信一覧"
                  tabIndex={0}
                >
                  {todayEntries.length ? (
                    todayEntries.map(({ notification, schedule }) => (
                      <Link
                        key={schedule.notificationScheduleId}
                        to={`/notifications/${notification.notificationId}`}
                      >
                        <time>{formatNotificationTime(schedule.sendAt)}</time>
                        <i
                          style={{ backgroundColor: colors[schedule.status] }}
                        />
                        <span>
                          <strong>{notification.content.push.title}</strong>
                          <small>
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
                    <p>本日の配信はありません</p>
                  )}
                </div>
              </>
            ) : (
              <p>今日を表示すると配信を確認できます</p>
            )}
          </aside>
          <section
            className="notification-calendar-sidebar"
            aria-labelledby="notification-calendar-status-heading"
          >
            <h2 id="notification-calendar-status-heading">状態</h2>
            <div className="notification-calendar-legend">
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
                <span key={status}>
                  <i style={{ backgroundColor: colors[status] }} />
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

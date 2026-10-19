import { Link } from "react-router";

import type { AdminNotificationListItem } from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  formatNotificationAudience,
  formatNotificationCreationMethod,
  formatNotificationCreator,
  formatNotificationDateTime,
  formatNotificationImportance,
} from "~/features/notifications/components/list/notification-display";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { selectRepresentativeSchedule } from "~/features/notifications/hooks/notification-list-data";

type NotificationGridProps = {
  items: readonly AdminNotificationListItem[];
};

export function NotificationGrid({ items }: NotificationGridProps) {
  if (items.length === 0) {
    return (
      <div className="border-border-base text-text-muted app-rounded border px-5 py-16 text-center">
        条件に一致する通知はありません
      </div>
    );
  }

  return (
    <div
      aria-label="通知グリッド"
      className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
    >
      {items.map((notification) => {
        const schedule = selectRepresentativeSchedule(notification);
        return (
          <article
            key={notification.notificationId}
            className="border-border-base bg-surface-base app-rounded flex min-w-0 flex-col gap-4 border p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-text-muted text-xs">
                  ID {notification.notificationId}
                </p>
                <Link
                  aria-label={`${notification.content.push.title}の詳細を表示`}
                  className="mt-1 block font-semibold hover:underline"
                  to={`/notifications/${notification.notificationId}`}
                >
                  {notification.content.push.title}
                </Link>
              </div>
              {schedule ? (
                <NotificationStatusBadge status={schedule.status} />
              ) : null}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-text-muted">配信日時</dt>
              <dd>{formatNotificationDateTime(schedule?.sendAt)}</dd>
              <dt className="text-text-muted">配信対象</dt>
              <dd className="min-w-0 truncate">
                {formatNotificationAudience(schedule)}
              </dd>
              <dt className="text-text-muted">作成方法</dt>
              <dd>{formatNotificationCreationMethod(notification)}</dd>
              <dt className="text-text-muted">作成者・参照元</dt>
              <dd>{formatNotificationCreator(notification)}</dd>
              <dt className="text-text-muted">重要度</dt>
              <dd>{formatNotificationImportance(notification.importance)}</dd>
              <dt className="text-text-muted">Schedule</dt>
              <dd>{notification.schedules.length}件</dd>
            </dl>
          </article>
        );
      })}
    </div>
  );
}

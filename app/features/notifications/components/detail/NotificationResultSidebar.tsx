import type {
  AdminNotificationDetail,
  NotificationScheduleSummary,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  formatNotificationDetailDateTime,
  formatStop,
  importanceLabel,
  scheduleStatusLabel,
} from "~/features/notifications/components/detail/notification-detail-display";
import { notificationAudienceLabels } from "~/features/notifications/components/notification-display";

export function NotificationResultSidebar({
  notification,
  selected,
}: {
  notification: AdminNotificationDetail;
  selected: NotificationScheduleSummary | null;
}) {
  return (
    <aside className="min-w-0 space-y-4">
      {selected ? (
        <>
          <section className="border-border-base bg-surface-base app-rounded border p-4">
            <h2 className="mb-3 font-semibold">対象指定</h2>
            <ul className="space-y-2 text-sm">
              {selected.audience.items.map((item, index) => (
                <li
                  key={index}
                  className="border-border-subtle flex justify-between gap-2 border-b pb-2 last:border-0 last:pb-0"
                >
                  <span>
                    {item.type === "all" ? "全員" : (item.label ?? "削除済み")}
                  </span>
                  <span className="text-text-muted">
                    {notificationAudienceLabels[item.type]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="border-border-base bg-surface-base app-rounded border p-4">
            <h2 className="mb-3 font-semibold">配信回の情報</h2>
            <dl className="space-y-3 text-sm">
              {[
                ["配信回 ID", `#${selected.notificationScheduleId}`],
                ["配信予定", formatNotificationDetailDateTime(selected.sendAt)],
                ["状態", scheduleStatusLabel[selected.status]],
                [
                  "設定者",
                  selected.scheduledBy?.userName ??
                    "不明（削除済みの可能性あり）",
                ],
                [
                  "作成日時",
                  formatNotificationDetailDateTime(selected.createdAt),
                ],
                ["停止情報", formatStop(selected.stop)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-border-subtle flex justify-between gap-3 border-b pb-2 last:border-0 last:pb-0"
                >
                  <dt className="text-text-muted shrink-0">{label}</dt>
                  <dd className="min-w-0 text-right break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : null}
      <section className="border-border-base bg-surface-base app-rounded border p-4">
        <h2 className="mb-3 font-semibold">通知情報</h2>
        <dl className="space-y-3 text-sm">
          {[
            ["Notification ID", `#${notification.notificationId}`],
            [
              "作成方法",
              notification.creation.method === "manual" ? "手動" : "自動",
            ],
            ["重要度", importanceLabel[notification.importance]],
            [
              "作成者",
              notification.creation.method === "automatic"
                ? "自動"
                : (notification.creation.user?.userName ?? "-"),
            ],
            [
              "作成日時",
              formatNotificationDetailDateTime(notification.createdAt),
            ],
            [
              "更新日時",
              formatNotificationDetailDateTime(notification.updatedAt),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt className="text-text-muted shrink-0">{label}</dt>
              <dd className="min-w-0 truncate" title={value}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </aside>
  );
}

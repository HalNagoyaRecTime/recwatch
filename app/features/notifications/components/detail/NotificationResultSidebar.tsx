import type {
  AdminNotificationDetail,
  NotificationScheduleSummary,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { formatNotificationScheduleDateTime } from "~/features/notifications/components/list/notification-display";
import {
  formatNotificationDetailDateTime,
  importanceLabel,
} from "~/features/notifications/components/detail/notification-detail-display";
import { notificationAudienceLabels } from "~/features/notifications/components/notification-display";
export function NotificationResultSidebar({
  notification,
  selected,
  onSelect,
}: {
  notification: AdminNotificationDetail;
  selected: NotificationScheduleSummary | null;
  onSelect: (id: number) => void;
}) {
  const formatCount = (value: number) =>
    selected?.audience.recipientResolution.status === "resolved"
      ? value.toLocaleString()
      : "-";
  return (
    <aside className="min-w-0 space-y-4">
      <section className="border-border-base bg-surface-base app-rounded border p-4">
        <h2 className="mb-3 font-semibold">配信履歴</h2>
        <div className="space-y-2">
          {notification.schedules.map((schedule, index) => (
            <button
              key={schedule.notificationScheduleId}
              type="button"
              aria-pressed={
                selected?.notificationScheduleId ===
                schedule.notificationScheduleId
              }
              onClick={() => onSelect(schedule.notificationScheduleId)}
              className={`app-rounded flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 p-2 text-left text-sm ${selected?.notificationScheduleId === schedule.notificationScheduleId ? "bg-surface-muted" : "hover:bg-surface-hover"}`}
            >
              <span>
                {index + 1}回目
                <p className="text-text-muted text-xs">
                  {formatNotificationScheduleDateTime(schedule.sendAt)} / #
                  {schedule.notificationScheduleId}
                </p>
              </span>
              <NotificationStatusBadge status={schedule.status} />
            </button>
          ))}
        </div>
      </section>
      {selected && (
        <>
          <section className="border-border-base bg-surface-base app-rounded border p-4">
            <h2 className="mb-3 font-semibold">配信結果</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                [
                  "対象",
                  selected.audience.recipientResolution.status === "resolved"
                    ? selected.audience.recipientResolution.resolvedCount.toLocaleString()
                    : "未確定",
                ],
                [
                  "成功",
                  formatCount(selected.recipientPushSummary.successCount),
                ],
                [
                  "未成功",
                  formatCount(selected.recipientPushSummary.failedCount),
                ],
                [
                  "送信先なし",
                  formatCount(selected.recipientPushSummary.noPushTargetCount),
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-text-muted text-xs">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="border-border-base bg-surface-base app-rounded border p-4">
            <h2 className="mb-3 font-semibold">対象指定</h2>
            <ul className="space-y-2 text-sm">
              {selected.audience.items.map((item, index) => (
                <li key={index} className="flex justify-between gap-2">
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
        </>
      )}
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

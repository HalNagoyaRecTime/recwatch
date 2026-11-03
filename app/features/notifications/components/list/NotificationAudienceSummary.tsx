import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { Button } from "~/components/ui/button/Button";
import type { AdminNotificationListSchedule } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { formatNotificationAudience } from "~/features/notifications/components/list/notification-display";
import { notificationAudienceLabels } from "~/features/notifications/components/notification-display";

export function NotificationAudienceSummary({
  schedule,
}: {
  schedule: AdminNotificationListSchedule | undefined;
}) {
  if (!schedule) return <span className="text-text-muted">-</span>;
  const { items, recipientResolution } = schedule.audience;
  const labels = items.map((item) =>
    item.type === "all"
      ? "全員"
      : `${notificationAudienceLabels[item.type]}：${item.label ?? "削除済み"}`
  );
  return (
    <div className="min-w-0 space-y-1">
      {items.length <= 1 ? (
        <span
          className="block truncate"
          title={formatNotificationAudience(schedule)}
        >
          {formatNotificationAudience(schedule)}
        </span>
      ) : (
        <FloatingPanel
          interaction="both"
          placement="bottom-start"
          trigger={
            <Button size="sm" variant="secondary">
              {items.length}件の対象指定
            </Button>
          }
          content={
            <ul className="space-y-2 p-3 text-sm">
              {labels.map((label, index) => (
                <li key={index}>{label}</li>
              ))}
            </ul>
          }
        />
      )}
      <p className="text-text-muted truncate text-xs">
        {recipientResolution.status === "resolved"
          ? `確定 ${recipientResolution.resolvedCount.toLocaleString()}人`
          : schedule.status === "resolving"
            ? "対象者確定中"
            : "人数は配信時に確定"}
      </p>
    </div>
  );
}

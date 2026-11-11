import type { AdminNotificationListSchedule } from "~/features/notifications/api/contracts/admin-notification-query-api";

export function NotificationPushSummary({
  schedule,
}: {
  schedule: AdminNotificationListSchedule | undefined;
}) {
  if (!schedule || schedule.audience.recipientResolution.status !== "resolved")
    return <span className="text-text-muted">-</span>;
  const summary = schedule.recipientPushSummary;
  const result = `成功 ${summary.successCount.toLocaleString()} / 未成功 ${summary.failedCount.toLocaleString()}${summary.noPushTargetCount > 0 ? ` / 送信先なし ${summary.noPushTargetCount.toLocaleString()}` : ""}`;
  return (
    <div className="min-w-0 space-y-1">
      <p className="truncate">{summary.totalCount.toLocaleString()}人</p>
      <p className="text-text-muted truncate text-xs" title={result}>
        {result}
      </p>
    </div>
  );
}

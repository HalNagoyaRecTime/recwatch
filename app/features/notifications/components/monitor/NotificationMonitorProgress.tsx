import type { MonitorSchedule } from "~/features/notifications/hooks/notification-monitor-data";

export function NotificationMonitorProgress({
  schedule,
}: {
  schedule: MonitorSchedule;
}) {
  const delivery = schedule.deliveryProgress;
  const values = [
    ["対象者", `${schedule.recipientProgress.count}人`],
    ["配送総数", `${delivery.totalCount}件`],
    ["送信待ち", `${delivery.pendingCount}件`],
    ["送信中", `${delivery.sendingCount}件`],
    ["再送待ち", `${delivery.retryWaitCount}件`],
    ["FCM受付成功", `${delivery.sentCount}件`],
    ["失敗", `${delivery.failedCount}件`],
    ["停止", `${delivery.stoppedCount}件`],
  ];
  return (
    <div>
      <p className="text-text-muted mb-2 text-xs">
        対象解決: {schedule.audienceProgress.resolvedCount} /{" "}
        {schedule.audienceProgress.totalCount}・
        {schedule.recipientProgress.status === "pending"
          ? "人数未確定"
          : "人数確定"}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        {values.map(([label, value]) => (
          <div className="bg-surface-muted rounded-md p-2" key={label}>
            <dt className="text-text-muted">{label}</dt>
            <dd className="text-text-base mt-0.5 text-sm font-semibold tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

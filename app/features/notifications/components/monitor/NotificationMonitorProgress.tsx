import type { NotificationScheduleDetail } from "~/features/notifications/api/contracts/notification-schedule-query-api";

export function NotificationMonitorProgress({
  detail,
}: {
  detail: NotificationScheduleDetail;
}) {
  const delivery = detail.deliveryProgress;
  const values = [
    ["対象者", `${detail.recipientProgress.count}人`],
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
        対象解決: {detail.audienceProgress.resolvedCount} /{" "}
        {detail.audienceProgress.totalCount}・
        {detail.recipientProgress.status === "pending"
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

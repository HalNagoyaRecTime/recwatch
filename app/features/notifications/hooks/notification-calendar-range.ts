import type { AdminNotificationListQuery } from "~/features/notifications/api/contracts/admin-notification-query-api";

export function toNotificationMonthRange(
  month: Date
): AdminNotificationListQuery {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  return {
    from: new Date(year, monthIndex, 1, 0, 0, 0, 0).toISOString(),
    to: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).toISOString(),
  };
}

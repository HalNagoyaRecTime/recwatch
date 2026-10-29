import type { AdminNotificationListQuery } from "~/features/notifications/api/contracts/admin-notification-query-api";

export function toNotificationMonthRange(
  month: Date
): AdminNotificationListQuery {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  return {
    from: `${year}-${String(monthIndex + 1).padStart(2, "0")}-01T00:00:00.000+09:00`,
    to: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${new Date(year, monthIndex + 1, 0).getDate()}T23:59:59.999+09:00`,
  };
}

export const notificationListPageSize = 20;

export function parseNotificationListPage(
  searchParams: URLSearchParams
): number {
  const value = Number(searchParams.get("page"));

  return Number.isInteger(value) && value > 0 ? value : 1;
}

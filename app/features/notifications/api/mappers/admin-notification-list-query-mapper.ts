import type { NotificationListQuery } from "~/features/notifications/api/contracts/notification-management-api";

export function toAdminNotificationListPath(query: NotificationListQuery) {
  const search = new URLSearchParams();

  if (query.sendStatus) search.set("sendStatus", query.sendStatus);
  if (query.eventId !== undefined) {
    search.set("eventId", String(query.eventId));
  }
  if (query.from) search.set("from", query.from);
  if (query.to) search.set("to", query.to);
  if (query.limit !== undefined) search.set("limit", String(query.limit));
  if (query.offset !== undefined) search.set("offset", String(query.offset));

  const queryString = search.toString();
  return `/api/v1/admin/notifications${queryString ? `?${queryString}` : ""}`;
}

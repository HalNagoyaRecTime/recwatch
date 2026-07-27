import type { NotificationListQuery } from "../model/managed-notification";

export function toAdminNotificationListPath(query: NotificationListQuery) {
  const search = new URLSearchParams();

  if (query.status) search.set("sendStatus", query.status);
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

import type { AdminNotificationDetail } from "~/features/notifications/api/contracts/admin-notification-types";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { toNotificationDateTimeInput } from "~/features/notifications/model/notification-schedule-time";

export function toNotificationDraft(
  notification: AdminNotificationDetail
): NotificationDraft {
  const schedule = notification.schedules[0];
  return {
    title: notification.content.push.title,
    body: notification.content.push.body,
    detailTitle: notification.content.detail.title,
    detailBody: notification.content.detail.body,
    importance: notification.importance,
    audiences: (schedule?.audience.items ?? [{ type: "all" as const }]).map(
      (audience, index) => ({
        key: `audience-${index + 1}`,
        type: audience.type,
        targetId: audience.type === "all" ? "" : String(audience.targetId),
      })
    ),
    deliveryTiming: "scheduled",
    scheduledAt: toNotificationDateTimeInput(schedule?.sendAt),
  };
}

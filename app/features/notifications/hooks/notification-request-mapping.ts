import type {
  AdminNotificationDetail,
  NotificationAudienceInputItem,
  NotificationCreateRequest,
  NotificationPatchRequest,
} from "~/features/notifications/api/contracts/admin-notification-command-api";
import type {
  NotificationAudienceInput,
  NotificationContent,
  NotificationDeliveryInput,
} from "~/features/notifications/api/contracts/admin-notification-types";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { canEditNotificationSchedule } from "~/features/notifications/model/notification-edit-policy";
import { toNotificationSendAt } from "~/features/notifications/model/notification-schedule-time";
import { toNotificationMarkdown } from "~/features/notifications/model/notification-markdown";
import { ClientError, ClientErrors } from "~/lib/client-error";

export function toNotificationCreateRequest(
  draft: NotificationDraft
): NotificationCreateRequest {
  return {
    content: toNotificationContent(draft),
    audience: toNotificationAudienceInput(draft.audiences),
    delivery: toNotificationDelivery(draft),
    importance: draft.importance,
  };
}

export function toNotificationAudienceInput(
  audiences: NotificationDraft["audiences"]
): NotificationAudienceInput {
  return { items: audiences.map(toAudienceInputItem) };
}

export function toNotificationPatchRequest(
  notification: AdminNotificationDetail,
  draft: NotificationDraft
): NotificationPatchRequest | null {
  const allSchedulesUnstarted = canEditNotificationSchedule(
    notification.schedules
  );
  if (!allSchedulesUnstarted) {
    return {
      content: {
        detail: toNotificationContent(draft).detail,
      },
    };
  }

  const schedule = notification.schedules[0];
  if (!schedule) return null;

  try {
    return {
      content: toNotificationContent(draft),
      importance: draft.importance,
      schedule: {
        notificationScheduleId: schedule.notificationScheduleId,
        audience: toNotificationAudienceInput(draft.audiences),
        delivery: toNotificationDelivery(draft),
      },
    };
  } catch {
    return null;
  }
}

function toNotificationContent(draft: NotificationDraft): NotificationContent {
  return {
    push: { title: draft.title.trim(), body: draft.body.trim() },
    detail: {
      title: draft.detailTitle.trim(),
      body: toNotificationMarkdown(draft.detailBody),
    },
  };
}

function toNotificationDelivery(
  draft: NotificationDraft
): NotificationDeliveryInput {
  if (draft.deliveryTiming !== "scheduled")
    return { type: "immediate", sendAt: null };
  if (!draft.scheduledAt) throw new ClientError(ClientErrors.INVALID_REQUEST);
  return { type: "scheduled", sendAt: toOffsetIsoString(draft.scheduledAt) };
}

function toAudienceInputItem(
  audience: NotificationDraft["audiences"][number]
): NotificationAudienceInputItem {
  if (audience.type === "all") return { type: "all" };

  const targetId = Number(audience.targetId);
  if (!Number.isSafeInteger(targetId) || targetId <= 0) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }
  return { type: audience.type, targetId };
}

function toOffsetIsoString(value: string) {
  const sendAt = toNotificationSendAt(value);
  if (!sendAt) throw new ClientError(ClientErrors.INVALID_REQUEST);
  return sendAt;
}

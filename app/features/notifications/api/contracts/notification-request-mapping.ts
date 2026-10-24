import type {
  AdminNotificationDetail,
  NotificationAudienceInputItem,
  NotificationCreateRequest,
  NotificationPatchRequest,
} from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationAudienceInput } from "~/features/notifications/api/contracts/admin-notification-types";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { ClientError, ClientErrors } from "~/lib/client-error";

export function toNotificationCreateRequest(
  draft: NotificationDraft
): NotificationCreateRequest {
  const title = draft.title.trim();
  const body = draft.body.trim();

  return {
    content: {
      push: { title, body },
      detail: {
        title: draft.detailTitle.trim(),
        body: draft.detailBody,
      },
    },
    audience: toNotificationAudienceInput(draft.audiences),
    delivery:
      draft.deliveryTiming === "scheduled" && draft.scheduledAt
        ? { type: "scheduled", sendAt: toOffsetIsoString(draft.scheduledAt) }
        : { type: "immediate", sendAt: null },
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
  const allSchedulesUnstarted = notification.schedules.every(
    (schedule) => schedule.status === "scheduled"
  );
  if (!allSchedulesUnstarted) {
    return {
      content: {
        detail: { title: draft.detailTitle, body: draft.detailBody },
      },
    };
  }

  const schedule = notification.schedules[0];
  if (!schedule) return null;

  const audienceItems = draft.audiences.map((audience) => {
    if (audience.type === "all") return { type: "all" as const };
    const targetId = Number(audience.targetId);
    return Number.isSafeInteger(targetId) && targetId > 0
      ? { type: audience.type, targetId }
      : null;
  });
  if (audienceItems.some((item) => item === null)) return null;

  const sendAt = draft.scheduledAt
    ? new Date(draft.scheduledAt).toISOString()
    : null;

  return {
    content: {
      push: { title: draft.title, body: draft.body },
      detail: { title: draft.detailTitle, body: draft.detailBody },
    },
    importance: draft.importance,
    schedule: {
      notificationScheduleId: schedule.notificationScheduleId,
      audience: { items: audienceItems.filter((item) => item !== null) },
      delivery:
        draft.deliveryTiming === "scheduled" && sendAt
          ? { type: "scheduled", sendAt }
          : { type: "immediate", sendAt: null },
    },
  };
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }

  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(
    2,
    "0"
  );
  const minutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 19);
  return `${local}${sign}${hours}:${minutes}`;
}

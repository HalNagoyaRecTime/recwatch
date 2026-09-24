import type { NotificationCreateRequestDto } from "~/features/notifications/api/dto/admin-notification-dto";
import type { NotificationAudienceInputItemDto } from "~/features/notifications/api/dto/notification-common-dto";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { ClientError, ClientErrors } from "~/lib/client-error";

export function toNotificationCreateRequest(
  draft: NotificationDraft
): NotificationCreateRequestDto {
  const title = draft.title.trim();
  const body = draft.body.trim();

  return {
    content: {
      push: { title, body },
      detail: { title, body },
    },
    audience: { items: [toAudienceInputItem(draft)] },
    delivery:
      draft.deliveryTiming === "scheduled" && draft.scheduledAt
        ? { type: "scheduled", sendAt: toOffsetIsoString(draft.scheduledAt) }
        : { type: "immediate", sendAt: null },
    importance: "normal",
  };
}

function toAudienceInputItem(
  draft: NotificationDraft
): NotificationAudienceInputItemDto {
  if (draft.audienceType === "all") return { type: "all" };

  const targetId = Number(draft.audienceId);
  if (!Number.isSafeInteger(targetId) || targetId <= 0) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }
  return { type: draft.audienceType, targetId };
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

import { NotificationSubmissionError } from "../application/notification-submission-error";
import type { NotificationDraft } from "../model/notification-draft";
import type {
  AdminNotificationAudienceRequest,
  CreateAdminNotificationRequest,
} from "./admin-notification-api-dto";

export function toCreateAdminNotificationRequest(
  draft: NotificationDraft,
  scheduledAt: Date
): CreateAdminNotificationRequest {
  return {
    title: draft.title.trim(),
    body: draft.body.trim(),
    audience: toAudienceRequest(draft),
    scheduledAt: scheduledAt.toISOString(),
  };
}

function toAudienceRequest(
  draft: NotificationDraft
): AdminNotificationAudienceRequest {
  if (draft.audienceType === "all") {
    return { type: "all" };
  }

  const audienceId = Number(draft.audienceId);
  if (!Number.isSafeInteger(audienceId) || audienceId <= 0) {
    throw new NotificationSubmissionError("invalid_request");
  }

  switch (draft.audienceType) {
    case "class_room":
      return { type: draft.audienceType, classRoomId: audienceId };
    case "gathering":
      return { type: draft.audienceType, gatheringId: audienceId };
    case "event_participants":
      return { type: draft.audienceType, eventId: audienceId };
  }
}

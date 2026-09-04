import { ClientError, ClientErrors } from "~/lib/client-error";
import type { NotificationSubmission } from "~/features/notifications/api/contracts/notification-submission-api";

export function toNotificationSubmission(
  response: unknown
): NotificationSubmission {
  if (!isRecord(response)) {
    throw new ClientError(ClientErrors.RESPONSE_PARSE_ERROR);
  }

  const notificationId = response.notification_id;
  const scheduleCount = response.schedule_count;
  const status = response.send_status;

  if (
    !isPositiveInteger(notificationId) ||
    !isNonNegativeInteger(scheduleCount) ||
    status !== "draft"
  ) {
    throw new ClientError(ClientErrors.RESPONSE_PARSE_ERROR);
  }

  return {
    notificationId,
    scheduleCount,
    status,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

import { NotificationSubmissionError } from "../application/notification-submission-error";
import type { NotificationSubmission } from "../application/notification-submitter";

export function toNotificationSubmission(
  response: unknown
): NotificationSubmission {
  if (!isRecord(response)) {
    throw new NotificationSubmissionError("unexpected");
  }

  const notificationId = response.notification_id;
  const scheduleCount = response.schedule_count;
  const status = response.send_status;

  if (
    !isPositiveInteger(notificationId) ||
    !isNonNegativeInteger(scheduleCount) ||
    status !== "draft"
  ) {
    throw new NotificationSubmissionError("unexpected");
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

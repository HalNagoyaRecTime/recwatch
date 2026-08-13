import {
  NotificationSubmissionError,
  type NotificationSubmissionErrorKind,
} from "~/features/notifications/api/contracts/errors/notification-submission-error";

import { readApiErrorStatus } from "./notification-api-error-mapper";

const errorKindByStatus: Partial<
  Record<number, NotificationSubmissionErrorKind>
> = {
  400: "invalid_request",
  401: "authentication_required",
  403: "forbidden",
  404: "audience_not_found",
  409: "no_active_devices",
};

export function toNotificationSubmissionError(error: unknown) {
  if (error instanceof NotificationSubmissionError) {
    return error;
  }

  const status = readApiErrorStatus(error);
  return new NotificationSubmissionError(
    status === null ? "unexpected" : (errorKindByStatus[status] ?? "unexpected")
  );
}

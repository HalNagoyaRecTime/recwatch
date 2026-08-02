import { ApiClientError } from "~/lib/api-client-error";
import {
  NotificationSubmissionError,
  type NotificationSubmissionErrorKind,
} from "../application/notification-submission-error";

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

  if (error instanceof ApiClientError) {
    return new NotificationSubmissionError(
      errorKindByStatus[error.status] ?? "unexpected"
    );
  }

  return new NotificationSubmissionError("unexpected");
}

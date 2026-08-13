import {
  NotificationAudienceLoadingError,
  type NotificationAudienceLoadingErrorKind,
} from "~/features/notifications/api/contracts/errors/notification-audience-loading-error";

import { readApiErrorStatus } from "./notification-api-error-mapper";

const errorKindByStatus: Partial<
  Record<number, NotificationAudienceLoadingErrorKind>
> = {
  401: "authentication_required",
  403: "forbidden",
} as const;

export function toNotificationAudienceLoadingError(error: unknown) {
  if (error instanceof NotificationAudienceLoadingError) {
    return error;
  }

  const status = readApiErrorStatus(error);
  return new NotificationAudienceLoadingError(
    status === null
      ? "unexpected"
      : (errorKindByStatus[status] ?? "unexpected"),
    { cause: error }
  );
}

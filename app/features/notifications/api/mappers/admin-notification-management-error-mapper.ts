import {
  NotificationManagementError,
  type NotificationManagementErrorKind,
} from "~/features/notifications/api/contracts/errors/notification-management-error";

import { readApiErrorStatus } from "./notification-api-error-mapper";

const errorKindByStatus: Partial<
  Record<number, NotificationManagementErrorKind>
> = {
  400: "invalid_request",
  401: "authentication_required",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
};

export function toNotificationManagementError(error: unknown) {
  if (error instanceof NotificationManagementError) {
    return error;
  }

  const status = readApiErrorStatus(error);
  return new NotificationManagementError(
    status === null ? "unexpected" : (errorKindByStatus[status] ?? "unexpected")
  );
}

import {
  NotificationManagementError,
  type NotificationManagementErrorKind,
} from "~/features/notifications/model/notification-management-error";

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

  const status = readStatus(error);
  return new NotificationManagementError(
    status === null ? "unexpected" : (errorKindByStatus[status] ?? "unexpected")
  );
}

function readStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return null;
}

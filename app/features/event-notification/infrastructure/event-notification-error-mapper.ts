import {
  EventNotificationError,
  type EventNotificationErrorKind,
} from "../application/event-notification-error";

const errorKindByStatus: Partial<Record<number, EventNotificationErrorKind>> = {
  400: "invalid_request",
  401: "authentication_required",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
};

export function toEventNotificationError(error: unknown) {
  if (error instanceof EventNotificationError) {
    return error;
  }

  const status = readStatus(error);
  return new EventNotificationError(
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

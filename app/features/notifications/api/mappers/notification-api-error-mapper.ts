import { ApiClientError } from "~/lib/api-client-error";
import {
  notificationApiErrorCodes,
  type NotificationApiErrorCode,
  type NotificationValidationDetailsDto,
} from "~/features/notifications/api/dto/notification-error-dto";

const notificationApiErrorCodeSet = new Set<string>(notificationApiErrorCodes);

export function readApiErrorStatus(error: unknown): number | null {
  if (error instanceof ApiClientError) {
    return error.status;
  }

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

export function readNotificationApiErrorCode(
  error: unknown
): NotificationApiErrorCode | null {
  if (
    error instanceof ApiClientError &&
    notificationApiErrorCodeSet.has(error.code)
  ) {
    return error.code as NotificationApiErrorCode;
  }
  return null;
}

export function readNotificationValidationDetails(
  error: unknown
): NotificationValidationDetailsDto | null {
  if (
    !(error instanceof ApiClientError) ||
    error.code !== "VALIDATION_ERROR" ||
    !isRecord(error.details) ||
    !isRecord(error.details.fieldErrors) ||
    !Array.isArray(error.details.formErrors)
  ) {
    return null;
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(error.details.fieldErrors)) {
    if (!Array.isArray(messages) || !messages.every(isString)) return null;
    fieldErrors[field] = messages;
  }
  if (!error.details.formErrors.every(isString)) return null;

  return { fieldErrors, formErrors: error.details.formErrors };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

import {
  notificationV2ErrorCodes,
  type NotificationV2ErrorCode,
} from "~/features/notifications/api/dto/notification-v2-api-dto";
import { ApiClientError } from "~/lib/api-client-error";

export type NotificationValidationErrorDetails = {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
};

export function isNotificationV2ApiError(
  error: unknown
): error is ApiClientError & { code: NotificationV2ErrorCode } {
  return (
    error instanceof ApiClientError &&
    (notificationV2ErrorCodes as readonly string[]).includes(error.code)
  );
}

export function getNotificationValidationErrorDetails(
  error: unknown
): NotificationValidationErrorDetails | null {
  if (
    !(error instanceof ApiClientError) ||
    error.code !== "VALIDATION_ERROR" ||
    !isValidationErrorDetails(error.details)
  ) {
    return null;
  }

  return error.details;
}

function isValidationErrorDetails(
  value: unknown
): value is NotificationValidationErrorDetails {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    isStringArrayRecord(candidate.fieldErrors) &&
    Array.isArray(candidate.formErrors) &&
    candidate.formErrors.every((item) => typeof item === "string")
  );
}

function isStringArrayRecord(
  value: unknown
): value is Record<string, string[]> {
  if (typeof value !== "object" || value === null) return false;

  return Object.values(value).every(
    (messages) =>
      Array.isArray(messages) &&
      messages.every((message) => typeof message === "string")
  );
}

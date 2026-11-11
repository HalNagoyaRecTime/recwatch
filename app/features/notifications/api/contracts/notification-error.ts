// OpenAPIのnotificationErrorCodeSchemaと一致させる
export const notificationApiErrorCodes = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "STAFF_REQUIRED",
  "ADMIN_NOTIFICATION_NOT_FOUND",
  "NOTIFICATION_SCHEDULE_NOT_FOUND",
  "NOTIFICATION_AUDIENCE_NOT_FOUND",
  "NOTIFICATION_IMPORTANCE_FORBIDDEN",
  "NOTIFICATION_PUSH_DELIVERY_NOT_FOUND",
  "NOTIFICATION_EDIT_NOT_ALLOWED",
  "NOTIFICATION_DELETE_NOT_ALLOWED",
  "NOTIFICATION_SCHEDULE_CANCEL_NOT_ALLOWED",
  "NOTIFICATION_SCHEDULE_STOP_NOT_ALLOWED",
  "NOTIFICATION_RESEND_NOT_ALLOWED",
] as const;

export type NotificationApiErrorCode =
  (typeof notificationApiErrorCodes)[number];

export type NotificationValidationDetails = {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
};

const notificationApiErrorCodeSet = new Set<string>(notificationApiErrorCodes);

export function readApiErrorStatus(error: unknown): number | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("status" in error) ||
    typeof error.status !== "number"
  ) {
    return null;
  }

  return error.status;
}

export function readNotificationApiErrorCode(
  error: unknown
): NotificationApiErrorCode | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    typeof error.code !== "string" ||
    !notificationApiErrorCodeSet.has(error.code)
  ) {
    return null;
  }

  return error.code as NotificationApiErrorCode;
}

export function readNotificationValidationDetails(
  error: unknown
): NotificationValidationDetails | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    error.code !== "VALIDATION_ERROR" ||
    !("details" in error) ||
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

export type NotificationValidationDetailsDto = {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
};

export type NotificationApiErrorDto = {
  error: {
    code: string;
    message: string;
    details?: NotificationValidationDetailsDto | unknown;
  };
};

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

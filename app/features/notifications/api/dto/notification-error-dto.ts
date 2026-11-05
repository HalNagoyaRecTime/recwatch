import type { NotificationValidationDetails } from "~/features/notifications/api/contracts/notification-error";

export {
  notificationApiErrorCodes,
  type NotificationApiErrorCode,
} from "~/features/notifications/api/contracts/notification-error";

export type NotificationValidationDetailsDto = NotificationValidationDetails;

export type NotificationApiErrorDto = {
  error: {
    code: string;
    message: string;
    details?: NotificationValidationDetails | unknown;
  };
};

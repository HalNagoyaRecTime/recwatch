import { NotificationManagementError } from "~/features/notifications/application/notification-management-error";
import type { NotificationUpdate } from "~/features/notifications/model/managed-notification";
import type { AdminNotificationUpdateRequest } from "~/features/notifications/infrastructure/admin-notification-management-api-dto";

export function toAdminNotificationUpdateRequest(
  update: NotificationUpdate
): AdminNotificationUpdateRequest {
  if (
    update.title === undefined &&
    update.body === undefined &&
    update.scheduledAt === undefined &&
    update.audience === undefined
  ) {
    throw new NotificationManagementError("invalid_request");
  }
  if (
    (update.title !== undefined && !update.title.trim()) ||
    (update.body !== undefined && !update.body.trim())
  ) {
    throw new NotificationManagementError("invalid_request");
  }

  return {
    ...(update.title !== undefined ? { title: update.title.trim() } : {}),
    ...(update.body !== undefined ? { body: update.body.trim() } : {}),
    ...(update.scheduledAt !== undefined
      ? { scheduledAt: update.scheduledAt }
      : {}),
    ...(update.audience !== undefined ? { audience: update.audience } : {}),
  };
}

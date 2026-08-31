import { ClientError, ClientErrors } from "~/lib/client-error";
import type { NotificationUpdate } from "~/features/notifications/api/contracts/notification-management-api";
import type { AdminNotificationUpdateRequest } from "~/features/notifications/api/dto/admin-notification-management-api-dto";

export function toAdminNotificationUpdateRequest(
  update: NotificationUpdate
): AdminNotificationUpdateRequest {
  if (
    update.title === undefined &&
    update.body === undefined &&
    update.scheduledAt === undefined &&
    update.audience === undefined
  ) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
  }
  if (
    (update.title !== undefined && !update.title.trim()) ||
    (update.body !== undefined && !update.body.trim())
  ) {
    throw new ClientError(ClientErrors.INVALID_REQUEST);
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

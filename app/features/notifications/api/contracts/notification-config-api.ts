import type {
  NotificationAudienceCount,
  NotificationAudienceCountRequest,
  NotificationConfig,
} from "~/features/notifications/api/contracts/admin-notification-types";

export interface NotificationConfigApi {
  getConfig(): Promise<NotificationConfig>;
  getAudienceCount(
    request: NotificationAudienceCountRequest
  ): Promise<NotificationAudienceCount>;
}

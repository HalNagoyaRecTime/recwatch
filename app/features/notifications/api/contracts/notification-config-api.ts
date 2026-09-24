import type {
  NotificationAudienceCountDto,
  NotificationAudienceCountRequestDto,
  NotificationConfigDto,
} from "~/features/notifications/api/dto/admin-notification-dto";

export interface NotificationConfigApi {
  getConfig(): Promise<NotificationConfigDto>;
  getAudienceCount(
    request: NotificationAudienceCountRequestDto
  ): Promise<NotificationAudienceCountDto>;
}

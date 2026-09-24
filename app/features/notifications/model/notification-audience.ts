import type { NotificationAudienceInputItemDto } from "~/features/notifications/api/dto/notification-common-dto";

export type NotificationAudienceType = NotificationAudienceInputItemDto["type"];

export type NotificationAudienceOption = {
  id: string;
  name: string;
  type: Exclude<NotificationAudienceType, "all">;
};

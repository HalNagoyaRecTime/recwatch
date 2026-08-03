import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience-option";

export interface NotificationAudienceApi {
  load(): Promise<NotificationAudienceOption[]>;
}

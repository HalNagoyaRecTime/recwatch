import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";

export interface NotificationAudienceApi {
  load(): Promise<NotificationAudienceOption[]>;
}

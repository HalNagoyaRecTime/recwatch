import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience-option";

export interface NotificationAudienceLoader {
  load(): Promise<NotificationAudienceOption[]>;
}

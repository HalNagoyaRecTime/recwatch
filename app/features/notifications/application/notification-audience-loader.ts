import type { NotificationAudienceOption } from "../model/notification-audience-option";

export interface NotificationAudienceLoader {
  load(): Promise<NotificationAudienceOption[]>;
}

import type { NotificationAudienceType } from "./notification-draft";

export type NotificationAudienceOption = {
  id: string;
  name: string;
  type: Exclude<NotificationAudienceType, "all">;
};

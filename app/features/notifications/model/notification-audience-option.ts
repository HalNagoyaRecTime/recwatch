import type { NotificationAudienceType } from "~/features/notifications/model/notification-draft";

export type NotificationAudienceOption = {
  id: string;
  name: string;
  type: Exclude<NotificationAudienceType, "all">;
};

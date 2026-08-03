import type { NotificationAudienceType } from "~/features/notifications/model/notification-audience";

export type NotificationDeliveryTiming = "now" | "scheduled";

export type NotificationDraft = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  audienceId: string;
  deliveryTiming?: NotificationDeliveryTiming;
  scheduledAt?: string;
};

export const initialNotificationDraft: NotificationDraft = {
  title: "",
  body: "",
  audienceType: "all",
  audienceId: "",
  deliveryTiming: "now",
  scheduledAt: "",
};

import type { NotificationAudienceType } from "~/features/notifications/model/notification-audience";

export type { NotificationAudienceType } from "~/features/notifications/model/notification-audience";

export const notificationImportanceLevels = ["low", "normal", "high"] as const;

export type NotificationImportance =
  (typeof notificationImportanceLevels)[number];

export type NotificationDeliveryTiming = "now" | "scheduled";

export type NotificationAudienceDraftItem = {
  key: string;
  type: NotificationAudienceType;
  targetId: string;
};

export type NotificationDraft = {
  title: string;
  body: string;
  detailTitle: string;
  detailBody: string;
  importance: NotificationImportance;
  audiences: NotificationAudienceDraftItem[];
  deliveryTiming?: NotificationDeliveryTiming;
  scheduledAt?: string;
};

export const initialNotificationDraft: NotificationDraft = {
  title: "",
  body: "",
  detailTitle: "",
  detailBody: "",
  importance: "normal",
  audiences: [{ key: "audience-1", type: "all", targetId: "" }],
  deliveryTiming: "now",
  scheduledAt: "",
};

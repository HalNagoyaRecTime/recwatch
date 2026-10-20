import type { NotificationAudienceType } from "~/features/notifications/model/notification-audience";
import type { NotificationImportanceDto } from "~/features/notifications/api/dto/notification-common-dto";

export type { NotificationAudienceType } from "~/features/notifications/model/notification-audience";

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
  importance: NotificationImportanceDto;
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

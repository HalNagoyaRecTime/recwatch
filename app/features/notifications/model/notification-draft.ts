import { NOTIFICATION_IMPORTANCE_LEVELS } from "~/features/notifications/model/notification-values";
import type {
  NotificationAudienceScopeType,
  NotificationAudienceType,
} from "~/features/notifications/model/notification-audience";

export type { NotificationAudienceType } from "~/features/notifications/model/notification-audience";

export const notificationImportanceLevels = NOTIFICATION_IMPORTANCE_LEVELS;

export type NotificationImportance =
  (typeof notificationImportanceLevels)[number];

export type NotificationDeliveryTiming = "now" | "scheduled";

export type NotificationAudienceDraftItem = {
  key: string;
  type: NotificationAudienceType;
  targetId: string;
};

/** allを除外した通知対象。対象選択UIと検索での絞り込みに使う */
export type NotificationAudienceScopeItem = {
  key: string;
  type: NotificationAudienceScopeType;
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

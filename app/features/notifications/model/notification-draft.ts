import type {
  NotificationAudienceScope,
  NotificationAudienceType,
  NotificationTargetOption,
} from "~/features/notifications/model/notification-audience";

export type { NotificationAudienceType } from "~/features/notifications/model/notification-audience";
export type {
  NotificationAudienceScope,
  NotificationTargetOption,
} from "~/features/notifications/model/notification-audience";

export type NotificationDeliveryTiming = "now" | "scheduled";
export type NotificationImportance = "low" | "normal" | "high";

export type NotificationDraft = {
  pushTitle?: string;
  pushBody?: string;
  title: string;
  body: string;
  markdownDescription?: string;
  importance?: NotificationImportance;
  audienceScope?: NotificationAudienceScope;
  targetSelections?: NotificationTargetOption[];
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

export const initialNotificationDesignDraft: NotificationDraft = {
  ...initialNotificationDraft,
  pushTitle: "",
  pushBody: "",
  markdownDescription: "",
  importance: "normal",
  audienceScope: "all",
  targetSelections: [],
};

// 既存フォームとの互換性を保つため、表示用ラベルはdraftモデルから公開する。
export const notificationAudienceLabels: Record<
  NotificationAudienceType,
  string
> = {
  all: "全体",
  class_room: "クラス",
  gathering: "集合",
  event_participants: "競技参加者",
};

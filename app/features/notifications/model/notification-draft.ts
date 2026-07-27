export type NotificationAudienceType =
  | "all"
  | "class_room"
  | "gathering_group"
  | "event_participants";

export type NotificationDraft = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  audienceId: string;
};

export const initialNotificationDraft: NotificationDraft = {
  title: "",
  body: "",
  audienceType: "all",
  audienceId: "",
};

export const notificationAudienceLabels: Record<
  NotificationAudienceType,
  string
> = {
  all: "全体",
  class_room: "クラス",
  gathering_group: "集合グループ",
  event_participants: "競技参加者",
};

export type NotificationAudienceType =
  | "all"
  | "class_room"
  | "gathering"
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
  gathering: "集合",
  event_participants: "競技参加者",
};

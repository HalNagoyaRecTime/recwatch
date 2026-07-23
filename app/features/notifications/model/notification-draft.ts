export type NotificationAudienceType = "all" | "group";

export type NotificationDraft = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  groupId: string;
};

export const initialNotificationDraft: NotificationDraft = {
  title: "",
  body: "",
  audienceType: "all",
  groupId: "",
};

export const notificationAudienceLabels: Record<
  NotificationAudienceType,
  string
> = {
  all: "全体",
  group: "グループ・チーム",
};

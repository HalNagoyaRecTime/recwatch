import type { NotificationTargetType } from "~/features/notifications/model/notification-target";

export type RelatedNotificationResource = {
  id: string;
  label: string;
  kind: "competition" | "schedule";
};

export type NotificationDraft = {
  title: string;
  body: string;
  targetType: NotificationTargetType;
  targetId: string;
  relatedResourceId: string;
  sendMode: "immediate";
};

export const initialNotificationDraft = {
  title: "",
  body: "",
  targetType: "all",
  targetId: "",
  relatedResourceId: "",
  sendMode: "immediate",
} satisfies NotificationDraft;

export const relatedNotificationResources = [
  {
    id: "competition-soccer",
    label: "サッカー",
    kind: "competition",
  },
  {
    id: "competition-relay",
    label: "リレー",
    kind: "competition",
  },
  {
    id: "schedule-opening",
    label: "開会式 / 09:00 体育館",
    kind: "schedule",
  },
  {
    id: "schedule-soccer-meeting",
    label: "サッカー集合 / 10:00 グラウンド",
    kind: "schedule",
  },
] satisfies RelatedNotificationResource[];

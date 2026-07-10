import type { NotificationTargetType } from "~/features/notifications/model/notification-target";

export type NotificationDraft = {
  title: string;
  body: string;
  targetType: NotificationTargetType;
  targetIds: string[];
};

export const initialNotificationDraft = {
  title: "",
  body: "",
  targetType: "all",
  targetIds: [],
} satisfies NotificationDraft;

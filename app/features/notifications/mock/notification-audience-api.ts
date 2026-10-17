import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";

export const mockNotificationAudienceOptions: NotificationAudienceOption[] = [
  { id: "1", name: "1年A組", type: "class_room" },
  { id: "2", name: "1年B組", type: "class_room" },
  { id: "1", name: "Aグループ", type: "gathering" },
  { id: "2", name: "Bグループ", type: "gathering" },
  { id: "1", name: "走れ！〇人〇脚！", type: "event" },
  { id: "2", name: "ガチンコ綱引き", type: "event" },
  { id: "123", name: "山田 太郎", type: "user" },
];

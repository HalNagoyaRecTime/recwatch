import type { NotificationAudienceOption } from "../model/notification-audience-option";

export const mockNotificationAudienceOptions: NotificationAudienceOption[] = [
  { id: "1", name: "1年A組", type: "class_room" },
  { id: "2", name: "1年B組", type: "class_room" },
  { id: "1", name: "Aグループ", type: "gathering" },
  { id: "2", name: "Bグループ", type: "gathering" },
  { id: "1", name: "走れ！〇人〇脚！", type: "event_participants" },
  { id: "2", name: "ガチンコ綱引き", type: "event_participants" },
];

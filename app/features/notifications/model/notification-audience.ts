export const notificationAudienceTypes = [
  "all",
  "class_room",
  "gathering",
  "event",
  "user",
] as const;

export type NotificationAudienceType =
  (typeof notificationAudienceTypes)[number];

export type NotificationAudienceOption = {
  id: string;
  name: string;
  type: Exclude<NotificationAudienceType, "all">;
};

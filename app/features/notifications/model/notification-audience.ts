export type NotificationAudienceType =
  | "all"
  | "class_room"
  | "gathering"
  | "event_participants";

export type NotificationAudienceScope = "all" | "specified";

export type NotificationTargetType = "person" | "class" | "team" | "gathering";

export type NotificationTargetOption = {
  coveredByIds?: string[];
  detail: string;
  id: string;
  name: string;
  recipientCount: number;
  type: NotificationTargetType;
};

export type NotificationAudience =
  | { type: "all" }
  | { type: "class_room"; classRoomId: number }
  | { type: "gathering"; gatheringId: number }
  | { type: "event_participants"; eventId: number }
  | { type: "resolved_recipients" };

export type NotificationAudienceOption = {
  id: string;
  name: string;
  type: Exclude<NotificationAudienceType, "all">;
};

export type AdminNotificationAudienceRequest =
  | { type: "all" }
  | { type: "class_room"; classRoomId: number }
  | { type: "gathering_group"; gatheringGroupId: number }
  | { type: "event_participants"; eventId: number };

export type CreateAdminNotificationRequest = {
  title: string;
  body: string;
  audience: AdminNotificationAudienceRequest;
  scheduledAt: string;
};

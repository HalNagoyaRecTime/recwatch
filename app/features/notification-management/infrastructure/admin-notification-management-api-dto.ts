export type AdminNotificationAudienceResponse =
  | {
      type: "event_participants";
      event_id: number;
      recipient_count: number;
    }
  | {
      type: "resolved_recipients";
      recipient_count: number;
    };

export type AdminNotificationDeliverySummaryResponse = {
  total: number;
  draft: number;
  sending: number;
  sent: number;
  failed: number;
};

export type AdminNotificationResponse = {
  notification_id: number;
  notification_type: string;
  title: string;
  body: string;
  scheduled_at: string;
  related_event_id: number | null;
  related_event_name: string | null;
  created_user_id: number | null;
  creator_name: string | null;
  recipient_count: number;
  audience: AdminNotificationAudienceResponse;
  delivery_summary: AdminNotificationDeliverySummaryResponse;
  created_at: string;
  updated_at: string;
};

export type AdminNotificationListResponse = {
  notifications: AdminNotificationResponse[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminNotificationUpdateRequest = {
  title?: string;
  body?: string;
  scheduledAt?: string;
  audience?:
    | { type: "all" }
    | { type: "class_room"; classRoomId: number }
    | { type: "gathering"; gatheringId: number }
    | { type: "event_participants"; eventId: number };
};

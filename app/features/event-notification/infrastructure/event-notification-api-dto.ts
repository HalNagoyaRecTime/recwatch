export type PatchEventRequest = {
  event_name?: string;
  rule_text?: string | null;
  venue?: string;
  start_time?: string;
  end_time?: string;
  notification_enabled?: boolean;
};

export type EventResponse = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venue: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type NotificationScheduleResponse = {
  notification_schedule_id: number;
  send_status: "draft" | "sending" | "sent" | "failed";
  send_at: string;
};

export type PatchEventResponse = {
  event: EventResponse;
  notification_enabled: boolean;
  notification_schedules: NotificationScheduleResponse[];
};

export type EventNotificationSummaryResponse = {
  event_id: number;
  scheduled_at: string | null;
  total: number;
  draft: number;
  sending: number;
  sent: number;
  failed: number;
};

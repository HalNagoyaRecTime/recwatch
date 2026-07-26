export type NotificationScheduleStatus =
  | "draft"
  | "sending"
  | "sent"
  | "failed"
  | "canceled";

export type NotificationSchedule = {
  id: string;
  title: string;
  body: string;
  audienceName: string;
  scheduledAt: string;
  creatorName: string;
  relatedEventName: string | null;
  relatedScheduleName: string | null;
  status: NotificationScheduleStatus;
};

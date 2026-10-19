export type EventNotificationStatus =
  | "none"
  | "draft"
  | "sending"
  | "sent"
  | "failed";

export type EventPatch = {
  eventId: number;
  name?: string;
  ruleText?: string | null;
  venue?: string;
  startTime?: string;
  endTime?: string;
  notificationEnabled?: boolean;
};

export type UpdatedEvent = {
  id: number;
  name: string;
  ruleText: string | null;
  venue: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
};

export type EventPatchResult = {
  event: UpdatedEvent;
  notificationEnabled: boolean;
  draftNotificationCount: number;
};

export type EventNotificationSummary = {
  eventId: number;
  scheduledAt: string | null;
  total: number;
  draft: number;
  sending: number;
  sent: number;
  failed: number;
  status: EventNotificationStatus;
  hasUpcomingNotification: boolean;
};

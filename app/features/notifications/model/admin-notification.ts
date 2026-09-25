export type NotificationScheduleStatus =
  "scheduled" | "resolving" | "sending" | "completed" | "failed" | "stopped";

export type NotificationImportance = "low" | "normal" | "high";

export type NotificationUserReference = {
  userId: number;
  userName: string;
};

export type NotificationContent = {
  push: { title: string; body: string };
  detail: { title: string; body: string };
};

export type NotificationAudienceInputItem =
  | { type: "all" }
  | {
      type: "class_room" | "gathering" | "event" | "user";
      targetId: number;
    };

export type NotificationAudienceInput = {
  items: NotificationAudienceInputItem[];
};

export type NotificationAudienceItem =
  | { type: "all"; label?: null }
  | {
      type: "class_room" | "gathering" | "event" | "user";
      targetId: number;
      label: string | null;
    };

export type NotificationAudience = {
  items: NotificationAudienceItem[];
  recipientResolution: {
    status: "pending" | "resolved";
    resolvedCount: number;
  };
};

export type NotificationDeliveryInput =
  { type: "immediate"; sendAt: null } | { type: "scheduled"; sendAt: string };

export type NotificationCreation =
  | {
      method: "manual";
      user: NotificationUserReference | null;
      source: null;
    }
  | {
      method: "automatic";
      user: null;
      source: {
        type: "gathering";
        id: number;
        label: string | null;
      };
    };

export type NotificationStop = {
  reason: "manual" | "source_deleted";
  stoppedAt: string;
  stoppedBy: NotificationUserReference | null;
};

export type NotificationRecipientPushSummary = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  noPushTargetCount: number;
};

export type AdminNotificationListSchedule = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatus;
  scheduledBy: NotificationUserReference | null;
  createdAt: string;
  audience: NotificationAudience;
  recipientPushSummary: NotificationRecipientPushSummary;
};

export type AdminNotificationListItem = {
  notificationId: number;
  content: { push: { title: string; body: string } };
  importance: NotificationImportance;
  creation: NotificationCreation;
  createdAt: string;
  schedules: AdminNotificationListSchedule[];
};

export type NotificationScheduleSummary = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatus;
  stop: NotificationStop | null;
  scheduledBy: NotificationUserReference | null;
  createdAt: string;
  audience: NotificationAudience;
  recipientPushSummary: NotificationRecipientPushSummary;
};

export type AdminNotificationDetail = {
  notificationId: number;
  content: NotificationContent;
  importance: NotificationImportance;
  creation: NotificationCreation;
  createdAt: string;
  updatedAt: string;
  schedules: NotificationScheduleSummary[];
};

export type NotificationContentPatch = {
  push?: { title?: string; body?: string };
  detail?: { title?: string; body?: string };
};

export type NotificationCreateRequest = {
  content: NotificationContent;
  audience: NotificationAudienceInput;
  delivery: NotificationDeliveryInput;
  importance: NotificationImportance;
};

export type NotificationPatchRequest = {
  content?: NotificationContentPatch;
  importance?: NotificationImportance;
  schedule?: {
    notificationScheduleId: number;
    audience?: NotificationAudienceInput;
    delivery?: NotificationDeliveryInput;
  };
};

import type {
  NotificationAudienceInput,
  NotificationContent,
  NotificationCreation,
  NotificationDateRangeQuery,
  NotificationDeliveryInput,
  NotificationImportance,
  NotificationPushContent,
  NotificationRecipientPushSummary,
  NotificationScheduleAudience,
  NotificationScheduleStatus,
  NotificationStop,
  NotificationUserReference,
} from "~/features/notifications/api/contracts/notification-common-types";

export type AdminNotificationListQuery = NotificationDateRangeQuery & {
  page?: number;
  limit?: number;
};

export type AdminNotificationListSchedule = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatus;
  scheduledBy: NotificationUserReference | null;
  createdAt: string;
  audience: NotificationScheduleAudience;
  recipientPushSummary: NotificationRecipientPushSummary;
};

export type AdminNotificationListItem = {
  notificationId: number;
  content: {
    push: NotificationPushContent;
  };
  importance: NotificationImportance;
  creation: NotificationCreation;
  createdAt: string;
  schedules: AdminNotificationListSchedule[];
};

export type AdminNotificationPagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

export type AdminNotificationListResponse = {
  items: AdminNotificationListItem[];
  pagination: AdminNotificationPagination;
};

export type NotificationScheduleSummary = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatus;
  stop: NotificationStop | null;
  scheduledBy: NotificationUserReference | null;
  createdAt: string;
  audience: NotificationScheduleAudience;
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

export type NotificationCreateRequest = {
  content: NotificationContent;
  audience: NotificationAudienceInput;
  delivery: NotificationDeliveryInput;
  importance: NotificationImportance;
};

export type NotificationCreateResponse = {
  notificationId: number;
  notificationScheduleId: number;
};

export type NotificationContentPatch = {
  push?: {
    title?: string;
    body?: string;
  };
  detail?: {
    title?: string;
    body?: string;
  };
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

export type NotificationConfig = {
  importance: {
    default: "normal";
    options: NotificationImportance[];
  };
};

export type NotificationAudienceCountRequest = {
  audience: NotificationAudienceInput;
};

export type NotificationAudienceCount = {
  recipientCount: number;
};

export type * from "~/features/notifications/api/contracts/notification-common-types";

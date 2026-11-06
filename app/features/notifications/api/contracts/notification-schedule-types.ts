import type {
  NotificationCreation,
  NotificationDateRangeQuery,
  NotificationImportance,
  NotificationPlatform,
  NotificationPushContent,
  NotificationPushDeliveryStatus,
  NotificationRecipientResolutionStatus,
  NotificationScheduleStatus,
  NotificationStop,
  NotificationUserReference,
} from "~/features/notifications/api/contracts/notification-common-types";
export type NotificationScheduleListQuery = NotificationDateRangeQuery;

export type NotificationScheduleListItem = {
  notificationId: number;
  notificationScheduleId: number;
  content: { push: NotificationPushContent };
  importance: NotificationImportance;
  sendAt: string;
  status: NotificationScheduleStatus;
  failureReason: string | null;
  stop: NotificationStop | null;
  creation: NotificationCreation;
};

export type NotificationScheduleListResponse = {
  items: NotificationScheduleListItem[];
};

export type NotificationDeliveryProgress = {
  totalCount: number;
  pendingCount: number;
  sendingCount: number;
  retryWaitCount: number;
  sentCount: number;
  failedCount: number;
  stoppedCount: number;
};

export type NotificationScheduleDetail = {
  notificationId: number;
  notificationScheduleId: number;
  content: { push: NotificationPushContent };
  importance: NotificationImportance;
  sendAt: string;
  status: NotificationScheduleStatus;
  failureReason: string | null;
  stop: NotificationStop | null;
  creation: NotificationCreation;
  audienceProgress: {
    totalCount: number;
    resolvedCount: number;
  };
  recipientProgress: {
    count: number;
    status: NotificationRecipientResolutionStatus;
  };
  deliveryProgress: NotificationDeliveryProgress;
};

export type NotificationScheduleResultsQuery = {
  page: number;
  limit: number;
};

export type NotificationResultDelivery = {
  notificationPushDeliveryId: number;
  platform: NotificationPlatform;
  status: NotificationPushDeliveryStatus;
  attemptCount: number;
  lastAttemptAt: string | null;
  sentAt: string | null;
};

export type NotificationScheduleResults = {
  notificationScheduleId: number;
  recipients: {
    items: Array<{
      notificationRecipientId: number;
      user: NotificationUserReference;
      deliveries: NotificationResultDelivery[];
    }>;
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  };
};

export type NotificationPushDeliveryDetail = {
  notificationPushDeliveryId: number;
  notificationRecipientId: number;
  firebaseTokenId: number | null;
  platform: NotificationPlatform;
  status: NotificationPushDeliveryStatus;
  attemptCount: number;
  firstAttemptAt: string | null;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  sentAt: string | null;
  failedReason: string | null;
  fcmMessageId: string | null;
};

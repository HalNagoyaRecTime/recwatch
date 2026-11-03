import type {
  NOTIFICATION_SCHEDULE_STATUSES,
  NOTIFICATION_PUSH_DELIVERY_STATUSES,
  NOTIFICATION_IMPORTANCE_LEVELS,
  NOTIFICATION_PLATFORMS,
  NOTIFICATION_TARGET_AUDIENCE_TYPES,
  NOTIFICATION_AUDIENCE_TYPES,
  NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES,
  NOTIFICATION_DELIVERY_TYPES,
  NOTIFICATION_CREATION_METHODS,
  NOTIFICATION_SOURCE_TYPES,
  NOTIFICATION_STOP_REASONS,
} from "~/features/notifications/model/notification-values";
export type NotificationScheduleStatus =
  (typeof NOTIFICATION_SCHEDULE_STATUSES)[number];

export type NotificationPushDeliveryStatus =
  (typeof NOTIFICATION_PUSH_DELIVERY_STATUSES)[number];

export type NotificationImportance =
  (typeof NOTIFICATION_IMPORTANCE_LEVELS)[number];

export type NotificationPlatform = (typeof NOTIFICATION_PLATFORMS)[number];

export type NotificationUserReference = {
  userId: number;
  userName: string;
};

export type NotificationPushContent = {
  title: string;
  body: string;
};

export type NotificationContent = {
  push: NotificationPushContent;
  detail: {
    title: string;
    body: string;
  };
};

export type NotificationTargetAudienceType =
  (typeof NOTIFICATION_TARGET_AUDIENCE_TYPES)[number];

export type NotificationAudienceInputItem =
  | { type: (typeof NOTIFICATION_AUDIENCE_TYPES)[0] }
  | {
      type: NotificationTargetAudienceType;
      targetId: number;
    };

export type NotificationAudienceItem =
  | { type: (typeof NOTIFICATION_AUDIENCE_TYPES)[0] }
  | {
      type: NotificationTargetAudienceType;
      targetId: number;
      label: string | null;
    };

export type NotificationAudienceInput = {
  items: NotificationAudienceInputItem[];
};

export type NotificationAudience = {
  items: NotificationAudienceItem[];
};

export type NotificationRecipientResolutionStatus =
  (typeof NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES)[number];

export type NotificationScheduleAudience = NotificationAudience & {
  recipientResolution: {
    status: NotificationRecipientResolutionStatus;
    resolvedCount: number;
  };
};

export type NotificationDeliveryInput =
  | { type: (typeof NOTIFICATION_DELIVERY_TYPES)[0]; sendAt: null }
  | { type: (typeof NOTIFICATION_DELIVERY_TYPES)[1]; sendAt: string };

export type NotificationSourceType = (typeof NOTIFICATION_SOURCE_TYPES)[number];

export type NotificationCreation =
  | {
      method: (typeof NOTIFICATION_CREATION_METHODS)[0];
      user: NotificationUserReference | null;
      source: null;
    }
  | {
      method: (typeof NOTIFICATION_CREATION_METHODS)[1];
      user: null;
      source: {
        type: NotificationSourceType;
        id: number;
        label: string | null;
      };
    };

export type NotificationStopReason = (typeof NOTIFICATION_STOP_REASONS)[number];

export type NotificationStop = {
  reason: NotificationStopReason;
  stoppedAt: string;
  stoppedBy: NotificationUserReference | null;
};

export type NotificationRecipientPushSummary = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  noPushTargetCount: number;
};

export type NotificationDateRangeQuery =
  { from?: undefined; to?: undefined } | { from: string; to: string };

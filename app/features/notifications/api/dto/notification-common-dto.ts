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
export {
  NOTIFICATION_SCHEDULE_STATUSES,
  NOTIFICATION_PUSH_DELIVERY_STATUSES,
  NOTIFICATION_IMPORTANCE_LEVELS,
  DEFAULT_NOTIFICATION_IMPORTANCE,
  NOTIFICATION_PLATFORMS,
  NOTIFICATION_TARGET_AUDIENCE_TYPES,
  NOTIFICATION_AUDIENCE_TYPES,
  NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES,
  NOTIFICATION_DELIVERY_TYPES,
  NOTIFICATION_CREATION_METHODS,
  NOTIFICATION_SOURCE_TYPES,
  NOTIFICATION_STOP_REASONS,
} from "~/features/notifications/model/notification-values";

export type NotificationScheduleStatusDto =
  (typeof NOTIFICATION_SCHEDULE_STATUSES)[number];

export type NotificationPushDeliveryStatusDto =
  (typeof NOTIFICATION_PUSH_DELIVERY_STATUSES)[number];

export type NotificationImportanceDto =
  (typeof NOTIFICATION_IMPORTANCE_LEVELS)[number];

export type NotificationPlatformDto = (typeof NOTIFICATION_PLATFORMS)[number];

export type NotificationUserReferenceDto = {
  userId: number;
  userName: string;
};

export type NotificationPushContentDto = {
  title: string;
  body: string;
};

export type NotificationContentDto = {
  push: NotificationPushContentDto;
  detail: {
    title: string;
    body: string;
  };
};

export type NotificationTargetAudienceTypeDto =
  (typeof NOTIFICATION_TARGET_AUDIENCE_TYPES)[number];

export type NotificationAudienceInputItemDto =
  | { type: (typeof NOTIFICATION_AUDIENCE_TYPES)[0] }
  | {
      type: NotificationTargetAudienceTypeDto;
      targetId: number;
    };

export type NotificationAudienceItemDto =
  | { type: (typeof NOTIFICATION_AUDIENCE_TYPES)[0] }
  | {
      type: NotificationTargetAudienceTypeDto;
      targetId: number;
      label: string | null;
    };

export type NotificationAudienceInputDto = {
  items: NotificationAudienceInputItemDto[];
};

export type NotificationAudienceDto = {
  items: NotificationAudienceItemDto[];
};

export type NotificationRecipientResolutionStatusDto =
  (typeof NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES)[number];

export type NotificationScheduleAudienceDto = NotificationAudienceDto & {
  recipientResolution: {
    status: NotificationRecipientResolutionStatusDto;
    resolvedCount: number;
  };
};

export type NotificationDeliveryInputDto =
  | { type: (typeof NOTIFICATION_DELIVERY_TYPES)[0]; sendAt: null }
  | { type: (typeof NOTIFICATION_DELIVERY_TYPES)[1]; sendAt: string };

export type NotificationSourceTypeDto =
  (typeof NOTIFICATION_SOURCE_TYPES)[number];

export type NotificationCreationDto =
  | {
      method: (typeof NOTIFICATION_CREATION_METHODS)[0];
      user: NotificationUserReferenceDto | null;
      source: null;
    }
  | {
      method: (typeof NOTIFICATION_CREATION_METHODS)[1];
      user: null;
      source: {
        type: NotificationSourceTypeDto;
        id: number;
        label: string | null;
      };
    };

export type NotificationStopReasonDto =
  (typeof NOTIFICATION_STOP_REASONS)[number];

export type NotificationStopDto = {
  reason: NotificationStopReasonDto;
  stoppedAt: string;
  stoppedBy: NotificationUserReferenceDto | null;
};

export type NotificationRecipientPushSummaryDto = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  noPushTargetCount: number;
};

export type NotificationDateRangeQueryDto =
  { from?: undefined; to?: undefined } | { from: string; to: string };

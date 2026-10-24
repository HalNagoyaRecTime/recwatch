export const NOTIFICATION_SCHEDULE_STATUSES = [
  "scheduled",
  "resolving",
  "sending",
  "completed",
  "failed",
  "stopped",
] as const;

export type NotificationScheduleStatusDto =
  (typeof NOTIFICATION_SCHEDULE_STATUSES)[number];

export const NOTIFICATION_PUSH_DELIVERY_STATUSES = [
  "pending",
  "sending",
  "retry_wait",
  "sent",
  "failed",
  "stopped",
] as const;

export type NotificationPushDeliveryStatusDto =
  (typeof NOTIFICATION_PUSH_DELIVERY_STATUSES)[number];

export const NOTIFICATION_IMPORTANCE_LEVELS = [
  "low",
  "normal",
  "high",
] as const;

export type NotificationImportanceDto =
  (typeof NOTIFICATION_IMPORTANCE_LEVELS)[number];

export const DEFAULT_NOTIFICATION_IMPORTANCE =
  "normal" as const satisfies NotificationImportanceDto;

export const NOTIFICATION_PLATFORMS = ["ios", "android"] as const;

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

export const NOTIFICATION_TARGET_AUDIENCE_TYPES = [
  "class_room",
  "gathering",
  "event",
  "user",
] as const;

export type NotificationTargetAudienceTypeDto =
  (typeof NOTIFICATION_TARGET_AUDIENCE_TYPES)[number];

export const NOTIFICATION_AUDIENCE_TYPES = [
  "all",
  ...NOTIFICATION_TARGET_AUDIENCE_TYPES,
] as const;

export type NotificationAudienceTypeDto =
  (typeof NOTIFICATION_AUDIENCE_TYPES)[number];

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

export const NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES = [
  "pending",
  "resolved",
] as const;

export type NotificationRecipientResolutionStatusDto =
  (typeof NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES)[number];

export type NotificationScheduleAudienceDto = NotificationAudienceDto & {
  recipientResolution: {
    status: NotificationRecipientResolutionStatusDto;
    resolvedCount: number;
  };
};

export const NOTIFICATION_DELIVERY_TYPES = ["immediate", "scheduled"] as const;

export type NotificationDeliveryTypeDto =
  (typeof NOTIFICATION_DELIVERY_TYPES)[number];

export type NotificationDeliveryInputDto =
  | { type: (typeof NOTIFICATION_DELIVERY_TYPES)[0]; sendAt: null }
  | { type: (typeof NOTIFICATION_DELIVERY_TYPES)[1]; sendAt: string };

export const NOTIFICATION_CREATION_METHODS = ["manual", "automatic"] as const;

export type NotificationCreationMethodDto =
  (typeof NOTIFICATION_CREATION_METHODS)[number];

export const NOTIFICATION_SOURCE_TYPES = ["gathering"] as const;

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

export const NOTIFICATION_STOP_REASONS = ["manual", "source_deleted"] as const;

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

export const notificationScheduleStatuses = [
  "scheduled",
  "resolving",
  "sending",
  "completed",
  "failed",
  "stopped",
] as const;

export type NotificationScheduleStatus =
  (typeof notificationScheduleStatuses)[number];

export const notificationPushDeliveryStatuses = [
  "pending",
  "sending",
  "retry_wait",
  "sent",
  "failed",
  "stopped",
] as const;

export type NotificationPushDeliveryStatus =
  (typeof notificationPushDeliveryStatuses)[number];

export type NotificationImportance = "low" | "normal" | "high";
export type NotificationStopReason = "manual" | "source_deleted";
export type NotificationPlatform = "ios" | "android";

export type NotificationUserReferenceDto = {
  userId: number;
  userName: string;
};

export type NotificationContentDto = {
  push: {
    title: string;
    body: string;
  };
  detail: {
    title: string;
    body: string;
  };
};

export type NotificationContentPatchDto = {
  push?: {
    title?: string;
    body?: string;
  };
  detail?: {
    title?: string;
    body?: string;
  };
};

export type NotificationAudienceInputItemDto =
  | { type: "all" }
  | {
      type: "class_room" | "gathering" | "event" | "user";
      targetId: number;
    };

export type NotificationAudienceItemDto =
  | { type: "all" }
  | {
      type: "class_room" | "gathering" | "event" | "user";
      targetId: number;
      label: string | null;
    };

export type NotificationAudienceInputDto = {
  items: NotificationAudienceInputItemDto[];
};

export type NotificationDeliveryInputDto =
  { type: "immediate"; sendAt: null } | { type: "scheduled"; sendAt: string };

export type NotificationCreationDto =
  | {
      method: "manual";
      user: NotificationUserReferenceDto | null;
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

export type NotificationCreateRequestDto = {
  content: NotificationContentDto;
  audience: NotificationAudienceInputDto;
  delivery: NotificationDeliveryInputDto;
  importance: NotificationImportance;
};

export type NotificationCreateResponseDto = {
  notificationId: number;
  notificationScheduleId: number;
};

export type NotificationPatchRequestDto = {
  content?: NotificationContentPatchDto;
  importance?: NotificationImportance;
  schedule?: {
    notificationScheduleId: number;
    audience?: NotificationAudienceInputDto;
    delivery?: NotificationDeliveryInputDto;
  };
};

export type NotificationRecipientResolutionDto = {
  status: "pending" | "resolved";
  resolvedCount: number;
};

export type NotificationScheduleAudienceDto = {
  items: NotificationAudienceItemDto[];
  recipientResolution: NotificationRecipientResolutionDto;
};

export type NotificationRecipientPushSummaryDto = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  noPushTargetCount: number;
};

export type NotificationScheduleStopDto = {
  reason: NotificationStopReason;
  stoppedAt: string;
  stoppedBy: NotificationUserReferenceDto | null;
};

export type NotificationScheduleSummaryDto = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatus;
  stop: NotificationScheduleStopDto | null;
  scheduledBy: NotificationUserReferenceDto | null;
  createdAt: string;
  audience: NotificationScheduleAudienceDto;
  recipientPushSummary: NotificationRecipientPushSummaryDto;
};

export type AdminNotificationScheduleListItemDto = Omit<
  NotificationScheduleSummaryDto,
  "stop"
>;

export type AdminNotificationDetailDto = {
  notificationId: number;
  content: NotificationContentDto;
  importance: NotificationImportance;
  creation: NotificationCreationDto;
  createdAt: string;
  updatedAt: string;
  schedules: NotificationScheduleSummaryDto[];
};

export type AdminNotificationListItemDto = {
  notificationId: number;
  content: {
    push: NotificationContentDto["push"];
  };
  importance: NotificationImportance;
  creation: NotificationCreationDto;
  createdAt: string;
  schedules: AdminNotificationScheduleListItemDto[];
};

export type AdminNotificationListResponseDto = {
  items: AdminNotificationListItemDto[];
};

export type NotificationConfigDto = {
  importance: {
    default: "normal";
    options: NotificationImportance[];
  };
};

export type NotificationAudienceCountRequestDto = {
  audience: NotificationAudienceInputDto;
};

export type NotificationAudienceCountResponseDto = {
  recipientCount: number;
};

export type NotificationScheduleListItemDto = {
  notificationId: number;
  notificationScheduleId: number;
  content: {
    push: NotificationContentDto["push"];
  };
  importance: NotificationImportance;
  sendAt: string;
  status: NotificationScheduleStatus;
  stop: NotificationScheduleStopDto | null;
  creation: NotificationCreationDto;
};

export type NotificationScheduleListResponseDto = {
  items: NotificationScheduleListItemDto[];
};

export type NotificationAudienceProgressDto = {
  totalCount: number;
  resolvedCount: number;
};

export type NotificationRecipientProgressDto = {
  count: number;
  status: "pending" | "resolved";
};

export type NotificationDeliveryProgressDto = {
  totalCount: number;
  pendingCount: number;
  sendingCount: number;
  retryWaitCount: number;
  sentCount: number;
  failedCount: number;
  stoppedCount: number;
};

export type NotificationScheduleDetailDto = NotificationScheduleListItemDto & {
  audienceProgress: NotificationAudienceProgressDto;
  recipientProgress: NotificationRecipientProgressDto;
  deliveryProgress: NotificationDeliveryProgressDto;
};

export type NotificationPushDeliveryDetailDto = {
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

export type NotificationRecipientResultDeliveryDto = {
  notificationPushDeliveryId: number;
  platform: NotificationPlatform;
  status: NotificationPushDeliveryStatus;
  attemptCount: number;
  lastAttemptAt: string | null;
  sentAt: string | null;
};

export type NotificationRecipientResultDto = {
  notificationRecipientId: number;
  user: NotificationUserReferenceDto;
  deliveries: NotificationRecipientResultDeliveryDto[];
};

export type NotificationScheduleResultsResponseDto = {
  notificationScheduleId: number;
  recipients: {
    items: NotificationRecipientResultDto[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  };
};

export type NotificationResendRequestDto = {
  delivery: NotificationDeliveryInputDto;
};

export type NotificationStopResponseDto = {
  notificationScheduleId: number;
  status: "stopped";
};

export type NotificationDateRangeQueryDto = {
  from?: string;
  to?: string;
};

export type NotificationScheduleResultsQueryDto = {
  page?: number;
  limit?: number;
};

export type ApiErrorDto = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const notificationV2ErrorCodes = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "STAFF_REQUIRED",
  "ADMIN_NOTIFICATION_NOT_FOUND",
  "NOTIFICATION_SCHEDULE_NOT_FOUND",
  "NOTIFICATION_AUDIENCE_NOT_FOUND",
  "NOTIFICATION_IMPORTANCE_FORBIDDEN",
  "NOTIFICATION_PUSH_DELIVERY_NOT_FOUND",
  "NOTIFICATION_EDIT_NOT_ALLOWED",
  "NOTIFICATION_DELETE_NOT_ALLOWED",
  "NOTIFICATION_SCHEDULE_CANCEL_NOT_ALLOWED",
  "NOTIFICATION_SCHEDULE_STOP_NOT_ALLOWED",
  "NOTIFICATION_RESEND_NOT_ALLOWED",
] as const;

export type NotificationV2ErrorCode = (typeof notificationV2ErrorCodes)[number];

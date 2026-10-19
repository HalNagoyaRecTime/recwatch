import type {
  NotificationCreationDto,
  NotificationDateRangeQueryDto,
  NotificationDeliveryInputDto,
  NotificationImportanceDto,
  NotificationPlatformDto,
  NotificationPushContentDto,
  NotificationPushDeliveryStatusDto,
  NotificationScheduleStatusDto,
  NotificationStopDto,
  NotificationUserReferenceDto,
} from "~/features/notifications/api/dto/notification-common-dto";

export type NotificationScheduleListQueryDto = NotificationDateRangeQueryDto;

export type NotificationScheduleListItemDto = {
  notificationId: number;
  notificationScheduleId: number;
  content: { push: NotificationPushContentDto };
  importance: NotificationImportanceDto;
  sendAt: string;
  status: NotificationScheduleStatusDto;
  stop: NotificationStopDto | null;
  creation: NotificationCreationDto;
};

export type NotificationScheduleListResponseDto = {
  items: NotificationScheduleListItemDto[];
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

export type NotificationScheduleDetailDto = {
  notificationId: number;
  notificationScheduleId: number;
  content: { push: NotificationPushContentDto };
  importance: NotificationImportanceDto;
  sendAt: string;
  status: NotificationScheduleStatusDto;
  stop: NotificationStopDto | null;
  creation: NotificationCreationDto;
  audienceProgress: {
    totalCount: number;
    resolvedCount: number;
  };
  recipientProgress: {
    count: number;
    status: "pending" | "resolved";
  };
  deliveryProgress: NotificationDeliveryProgressDto;
};

export type NotificationScheduleResultsQueryDto = {
  page: number;
  limit: number;
};

export type NotificationResultDeliveryDto = {
  notificationPushDeliveryId: number;
  platform: NotificationPlatformDto;
  status: NotificationPushDeliveryStatusDto;
  attemptCount: number;
  lastAttemptAt: string | null;
  sentAt: string | null;
};

export type NotificationScheduleResultsDto = {
  notificationScheduleId: number;
  recipients: {
    items: Array<{
      notificationRecipientId: number;
      user: NotificationUserReferenceDto;
      deliveries: NotificationResultDeliveryDto[];
    }>;
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

export type NotificationResendResponseDto = {
  notificationId: number;
  notificationScheduleId: number;
};

export type NotificationStopResponseDto = {
  notificationScheduleId: number;
  status: "stopped";
};

export type NotificationPushDeliveryDetailDto = {
  notificationPushDeliveryId: number;
  notificationRecipientId: number;
  firebaseTokenId: number | null;
  platform: NotificationPlatformDto;
  status: NotificationPushDeliveryStatusDto;
  attemptCount: number;
  firstAttemptAt: string | null;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  sentAt: string | null;
  failedReason: string | null;
  fcmMessageId: string | null;
};

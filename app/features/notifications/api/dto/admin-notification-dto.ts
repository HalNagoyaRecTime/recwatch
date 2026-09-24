import type {
  NotificationAudienceDto,
  NotificationAudienceInputDto,
  NotificationContentDto,
  NotificationCreationDto,
  NotificationDateRangeQueryDto,
  NotificationDeliveryInputDto,
  NotificationImportanceDto,
  NotificationPushContentDto,
  NotificationRecipientPushSummaryDto,
  NotificationScheduleStatusDto,
  NotificationStopDto,
  NotificationUserReferenceDto,
} from "~/features/notifications/api/dto/notification-common-dto";

export type AdminNotificationListQueryDto = NotificationDateRangeQueryDto;

export type AdminNotificationListScheduleDto = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatusDto;
  scheduledBy: NotificationUserReferenceDto | null;
  createdAt: string;
  audience: NotificationAudienceDto;
  recipientPushSummary: NotificationRecipientPushSummaryDto;
};

export type AdminNotificationListItemDto = {
  notificationId: number;
  content: {
    push: NotificationPushContentDto;
  };
  importance: NotificationImportanceDto;
  creation: NotificationCreationDto;
  createdAt: string;
  schedules: AdminNotificationListScheduleDto[];
};

export type AdminNotificationListResponseDto = {
  items: AdminNotificationListItemDto[];
};

export type NotificationScheduleSummaryDto = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatusDto;
  stop: NotificationStopDto | null;
  scheduledBy: NotificationUserReferenceDto | null;
  createdAt: string;
  audience: NotificationAudienceDto;
  recipientPushSummary: NotificationRecipientPushSummaryDto;
};

export type AdminNotificationDetailDto = {
  notificationId: number;
  content: NotificationContentDto;
  importance: NotificationImportanceDto;
  creation: NotificationCreationDto;
  createdAt: string;
  updatedAt: string;
  schedules: NotificationScheduleSummaryDto[];
};

export type NotificationCreateRequestDto = {
  content: NotificationContentDto;
  audience: NotificationAudienceInputDto;
  delivery: NotificationDeliveryInputDto;
  importance: NotificationImportanceDto;
};

export type NotificationCreateResponseDto = {
  notificationId: number;
  notificationScheduleId: number;
};

type NotificationContentPatchDto = {
  push?: {
    title?: string;
    body?: string;
  };
  detail?: {
    title?: string;
    body?: string;
  };
};

export type NotificationPatchRequestDto = {
  content?: NotificationContentPatchDto;
  importance?: NotificationImportanceDto;
  schedule?: {
    notificationScheduleId: number;
    audience?: NotificationAudienceInputDto;
    delivery?: NotificationDeliveryInputDto;
  };
};

export type NotificationPatchResponseDto = AdminNotificationDetailDto;

export type NotificationConfigDto = {
  importance: {
    default: "normal";
    options: NotificationImportanceDto[];
  };
};

export type NotificationAudienceCountRequestDto = {
  audience: NotificationAudienceInputDto;
};

export type NotificationAudienceCountDto = {
  recipientCount: number;
};

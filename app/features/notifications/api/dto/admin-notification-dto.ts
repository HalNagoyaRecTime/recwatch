import type {
  NotificationAudienceInputDto,
  NotificationContentDto,
  NotificationCreationDto,
  NotificationDeliveryInputDto,
  NotificationImportanceDto,
  NotificationPushContentDto,
  NotificationRecipientPushSummaryDto,
  NotificationScheduleAudienceDto,
  NotificationScheduleStatusDto,
  NotificationStopDto,
  NotificationUserReferenceDto,
} from "~/features/notifications/api/dto/notification-common-dto";

export type AdminNotificationListScheduleDto = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatusDto;
  scheduledBy: NotificationUserReferenceDto | null;
  createdAt: string;
  audience: NotificationScheduleAudienceDto;
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

export type AdminNotificationPaginationDto = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

export type AdminNotificationListResponseDto = {
  items: AdminNotificationListItemDto[];
  pagination: AdminNotificationPaginationDto;
};

export type NotificationScheduleSummaryDto = {
  notificationScheduleId: number;
  sendAt: string;
  status: NotificationScheduleStatusDto;
  stop: NotificationStopDto | null;
  scheduledBy: NotificationUserReferenceDto | null;
  createdAt: string;
  audience: NotificationScheduleAudienceDto;
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

export type NotificationPatchRequestDto = {
  content?: NotificationContentPatchDto;
  importance?: NotificationImportanceDto;
  schedule?: {
    notificationScheduleId: number;
    audience?: NotificationAudienceInputDto;
    delivery?: NotificationDeliveryInputDto;
  };
};

export type NotificationConfigDto = {
  importance: {
    default: "normal";
    options: NotificationImportanceDto[];
  };
};

export type NotificationAudienceCountDto = {
  recipientCount: number;
};

import type {
  AdminNotificationDetailDto,
  AdminNotificationListItemDto,
  AdminNotificationListResponseDto,
  AdminNotificationListScheduleDto,
  NotificationAudienceCountDto,
  NotificationConfigDto,
  NotificationCreateResponseDto,
  NotificationScheduleSummaryDto,
} from "~/features/notifications/api/dto/admin-notification-dto";
import {
  isNotificationAudience,
  isNotificationContent,
  isNotificationCreation,
  isNotificationImportance,
  isNotificationPushContent,
  isNotificationRecipientPushSummary,
  isNotificationScheduleStatus,
  isNullableNotificationStop,
  isNullableNotificationUserReference,
  isNonNegativeInteger,
  isPositiveInteger,
  isRecord,
  isString,
} from "~/features/notifications/api/mappers/notification-dto-validator";

export function isAdminNotificationListResponse(
  value: unknown
): value is AdminNotificationListResponseDto {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isAdminNotificationListItem)
  );
}

export function isAdminNotificationDetail(
  value: unknown
): value is AdminNotificationDetailDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationId) &&
    isNotificationContent(value.content) &&
    isNotificationImportance(value.importance) &&
    isNotificationCreation(value.creation) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    Array.isArray(value.schedules) &&
    value.schedules.every(isNotificationScheduleSummary)
  );
}

export function isNotificationCreateResponse(
  value: unknown
): value is NotificationCreateResponseDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationId) &&
    isPositiveInteger(value.notificationScheduleId)
  );
}

export function isNotificationConfig(
  value: unknown
): value is NotificationConfigDto {
  return (
    isRecord(value) &&
    isRecord(value.importance) &&
    value.importance.default === "normal" &&
    Array.isArray(value.importance.options) &&
    value.importance.options.every(isNotificationImportance)
  );
}

export function isNotificationAudienceCount(
  value: unknown
): value is NotificationAudienceCountDto {
  return isRecord(value) && isNonNegativeInteger(value.recipientCount);
}

function isAdminNotificationListItem(
  value: unknown
): value is AdminNotificationListItemDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationId) &&
    isRecord(value.content) &&
    isNotificationPushContent(value.content.push) &&
    isNotificationImportance(value.importance) &&
    isNotificationCreation(value.creation) &&
    isString(value.createdAt) &&
    Array.isArray(value.schedules) &&
    value.schedules.every(isAdminNotificationListSchedule)
  );
}

function isAdminNotificationListSchedule(
  value: unknown
): value is AdminNotificationListScheduleDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationScheduleId) &&
    isString(value.sendAt) &&
    isNotificationScheduleStatus(value.status) &&
    isNullableNotificationUserReference(value.scheduledBy) &&
    isString(value.createdAt) &&
    isNotificationAudience(value.audience) &&
    isNotificationRecipientPushSummary(value.recipientPushSummary)
  );
}

function isNotificationScheduleSummary(
  value: unknown
): value is NotificationScheduleSummaryDto {
  return (
    isAdminNotificationListSchedule(value) &&
    "stop" in value &&
    isNullableNotificationStop(value.stop)
  );
}

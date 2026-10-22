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
import { DEFAULT_NOTIFICATION_IMPORTANCE } from "~/features/notifications/api/dto/notification-common-dto";
import {
  isNotificationContent,
  isNotificationCreation,
  isNotificationImportance,
  isNotificationPushContent,
  isNotificationRecipientPushSummary,
  isNotificationScheduleAudience,
  isNotificationScheduleStatus,
  isNullableNotificationStop,
  isNullableNotificationUserReference,
  hasExactKeys,
  isNonNegativeInteger,
  isPositiveInteger,
  isRecord,
  isUtcDateTimeString,
} from "~/features/notifications/api/mappers/notification-dto-validator";

export function isAdminNotificationListResponse(
  value: unknown
): value is AdminNotificationListResponseDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["items"]) &&
    Array.isArray(value.items) &&
    value.items.every(isAdminNotificationListItem)
  );
}

export function isAdminNotificationDetail(
  value: unknown
): value is AdminNotificationDetailDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationId",
      "content",
      "importance",
      "creation",
      "createdAt",
      "updatedAt",
      "schedules",
    ]) &&
    isPositiveInteger(value.notificationId) &&
    isNotificationContent(value.content) &&
    isNotificationImportance(value.importance) &&
    isNotificationCreation(value.creation) &&
    isUtcDateTimeString(value.createdAt) &&
    isUtcDateTimeString(value.updatedAt) &&
    Array.isArray(value.schedules) &&
    value.schedules.every(isNotificationScheduleSummary)
  );
}

export function isNotificationCreateResponse(
  value: unknown
): value is NotificationCreateResponseDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["notificationId", "notificationScheduleId"]) &&
    isPositiveInteger(value.notificationId) &&
    isPositiveInteger(value.notificationScheduleId)
  );
}

export function isNotificationConfig(
  value: unknown
): value is NotificationConfigDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["importance"]) &&
    isRecord(value.importance) &&
    hasExactKeys(value.importance, ["default", "options"]) &&
    value.importance.default === DEFAULT_NOTIFICATION_IMPORTANCE &&
    Array.isArray(value.importance.options) &&
    value.importance.options.every(isNotificationImportance)
  );
}

export function isNotificationAudienceCount(
  value: unknown
): value is NotificationAudienceCountDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["recipientCount"]) &&
    isNonNegativeInteger(value.recipientCount)
  );
}

function isAdminNotificationListItem(
  value: unknown
): value is AdminNotificationListItemDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationId",
      "content",
      "importance",
      "creation",
      "createdAt",
      "schedules",
    ]) &&
    isPositiveInteger(value.notificationId) &&
    isRecord(value.content) &&
    hasExactKeys(value.content, ["push"]) &&
    isNotificationPushContent(value.content.push) &&
    isNotificationImportance(value.importance) &&
    isNotificationCreation(value.creation) &&
    isUtcDateTimeString(value.createdAt) &&
    Array.isArray(value.schedules) &&
    value.schedules.every(isAdminNotificationListSchedule)
  );
}

function isAdminNotificationListSchedule(
  value: unknown
): value is AdminNotificationListScheduleDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationScheduleId",
      "sendAt",
      "status",
      "scheduledBy",
      "createdAt",
      "audience",
      "recipientPushSummary",
    ]) &&
    isAdminNotificationScheduleFields(value)
  );
}

function isNotificationScheduleSummary(
  value: unknown
): value is NotificationScheduleSummaryDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationScheduleId",
      "sendAt",
      "status",
      "stop",
      "scheduledBy",
      "createdAt",
      "audience",
      "recipientPushSummary",
    ]) &&
    isAdminNotificationScheduleFields(value) &&
    isNullableNotificationStop(value.stop)
  );
}

function isAdminNotificationScheduleFields(
  value: Record<string, unknown>
): boolean {
  return (
    isPositiveInteger(value.notificationScheduleId) &&
    isUtcDateTimeString(value.sendAt) &&
    isNotificationScheduleStatus(value.status) &&
    isNullableNotificationUserReference(value.scheduledBy) &&
    isUtcDateTimeString(value.createdAt) &&
    isNotificationScheduleAudience(value.audience) &&
    isNotificationRecipientPushSummary(value.recipientPushSummary)
  );
}

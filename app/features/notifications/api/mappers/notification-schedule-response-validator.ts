import type {
  NotificationPushDeliveryDetailDto,
  NotificationResultDeliveryDto,
  NotificationScheduleDetailDto,
  NotificationScheduleListItemDto,
  NotificationScheduleListResponseDto,
  NotificationScheduleResultsDto,
  NotificationStopResponseDto,
} from "~/features/notifications/api/dto/notification-schedule-dto";
import {
  isNotificationCreation,
  isNotificationDeliveryProgress,
  isNotificationImportance,
  isNotificationPlatform,
  isNotificationPushContent,
  isNotificationPushDeliveryStatus,
  isNotificationRecipientResolutionStatus,
  isNotificationScheduleStatus,
  isNotificationUserReference,
  isNullableNotificationStop,
  isNullablePositiveInteger,
  isNullableString,
  isNullableUtcDateTimeString,
  isNonNegativeInteger,
  isPositiveInteger,
  isRecord,
  isUtcDateTimeString,
  hasExactKeys,
} from "~/features/notifications/api/mappers/notification-dto-validator";

export function isNotificationScheduleListResponse(
  value: unknown
): value is NotificationScheduleListResponseDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["items"]) &&
    Array.isArray(value.items) &&
    value.items.every(isNotificationScheduleListItem)
  );
}

export function isNotificationScheduleDetail(
  value: unknown
): value is NotificationScheduleDetailDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationId",
      "notificationScheduleId",
      "content",
      "importance",
      "sendAt",
      "status",
      "failureReason",
      "stop",
      "creation",
      "audienceProgress",
      "recipientProgress",
      "deliveryProgress",
    ]) &&
    isPositiveInteger(value.notificationId) &&
    isPositiveInteger(value.notificationScheduleId) &&
    isRecord(value.content) &&
    hasExactKeys(value.content, ["push"]) &&
    isNotificationPushContent(value.content.push) &&
    isNotificationImportance(value.importance) &&
    isUtcDateTimeString(value.sendAt) &&
    isNotificationScheduleStatus(value.status) &&
    isNullableString(value.failureReason) &&
    isNullableNotificationStop(value.stop) &&
    isNotificationCreation(value.creation) &&
    isRecord(value.audienceProgress) &&
    hasExactKeys(value.audienceProgress, ["totalCount", "resolvedCount"]) &&
    isNonNegativeInteger(value.audienceProgress.totalCount) &&
    isNonNegativeInteger(value.audienceProgress.resolvedCount) &&
    isRecord(value.recipientProgress) &&
    hasExactKeys(value.recipientProgress, ["count", "status"]) &&
    isNonNegativeInteger(value.recipientProgress.count) &&
    isNotificationRecipientResolutionStatus(value.recipientProgress.status) &&
    isNotificationDeliveryProgress(value.deliveryProgress)
  );
}

export function isNotificationScheduleResults(
  value: unknown
): value is NotificationScheduleResultsDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["notificationScheduleId", "recipients"]) &&
    isPositiveInteger(value.notificationScheduleId) &&
    isRecord(value.recipients) &&
    hasExactKeys(value.recipients, ["items", "pagination"]) &&
    Array.isArray(value.recipients.items) &&
    value.recipients.items.every(isNotificationResultRecipient) &&
    isRecord(value.recipients.pagination) &&
    hasExactKeys(value.recipients.pagination, [
      "page",
      "limit",
      "totalCount",
      "totalPages",
    ]) &&
    isPositiveInteger(value.recipients.pagination.page) &&
    isPositiveInteger(value.recipients.pagination.limit) &&
    isNonNegativeInteger(value.recipients.pagination.totalCount) &&
    isNonNegativeInteger(value.recipients.pagination.totalPages)
  );
}

export function isNotificationPushDeliveryDetail(
  value: unknown
): value is NotificationPushDeliveryDetailDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationPushDeliveryId",
      "notificationRecipientId",
      "firebaseTokenId",
      "platform",
      "status",
      "attemptCount",
      "firstAttemptAt",
      "lastAttemptAt",
      "nextRetryAt",
      "sentAt",
      "failedReason",
      "fcmMessageId",
    ]) &&
    isPositiveInteger(value.notificationPushDeliveryId) &&
    isPositiveInteger(value.notificationRecipientId) &&
    isNullablePositiveInteger(value.firebaseTokenId) &&
    isNotificationPlatform(value.platform) &&
    isNotificationPushDeliveryStatus(value.status) &&
    isNonNegativeInteger(value.attemptCount) &&
    isNullableUtcDateTimeString(value.firstAttemptAt) &&
    isNullableUtcDateTimeString(value.lastAttemptAt) &&
    isNullableUtcDateTimeString(value.nextRetryAt) &&
    isNullableUtcDateTimeString(value.sentAt) &&
    isNullableString(value.failedReason) &&
    isNullableString(value.fcmMessageId)
  );
}

export function isNotificationStopResponse(
  value: unknown
): value is NotificationStopResponseDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["notificationScheduleId", "status"]) &&
    isPositiveInteger(value.notificationScheduleId) &&
    value.status === "stopped"
  );
}

function isNotificationScheduleListItem(
  value: unknown
): value is NotificationScheduleListItemDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationId",
      "notificationScheduleId",
      "content",
      "importance",
      "sendAt",
      "status",
      "failureReason",
      "stop",
      "creation",
    ]) &&
    isPositiveInteger(value.notificationId) &&
    isPositiveInteger(value.notificationScheduleId) &&
    isRecord(value.content) &&
    hasExactKeys(value.content, ["push"]) &&
    isNotificationPushContent(value.content.push) &&
    isNotificationImportance(value.importance) &&
    isUtcDateTimeString(value.sendAt) &&
    isNotificationScheduleStatus(value.status) &&
    isNullableString(value.failureReason) &&
    isNullableNotificationStop(value.stop) &&
    isNotificationCreation(value.creation)
  );
}

function isNotificationResultRecipient(value: unknown) {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["notificationRecipientId", "user", "deliveries"]) &&
    isPositiveInteger(value.notificationRecipientId) &&
    isNotificationUserReference(value.user) &&
    Array.isArray(value.deliveries) &&
    value.deliveries.every(isNotificationResultDelivery)
  );
}

function isNotificationResultDelivery(
  value: unknown
): value is NotificationResultDeliveryDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "notificationPushDeliveryId",
      "platform",
      "status",
      "attemptCount",
      "lastAttemptAt",
      "sentAt",
    ]) &&
    isPositiveInteger(value.notificationPushDeliveryId) &&
    isNotificationPlatform(value.platform) &&
    isNotificationPushDeliveryStatus(value.status) &&
    isNonNegativeInteger(value.attemptCount) &&
    isNullableUtcDateTimeString(value.lastAttemptAt) &&
    isNullableUtcDateTimeString(value.sentAt)
  );
}

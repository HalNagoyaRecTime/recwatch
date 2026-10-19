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
  isNotificationPushContent,
  isNotificationPushDeliveryStatus,
  isNotificationScheduleStatus,
  isNotificationUserReference,
  isNullableNotificationStop,
  isNullablePositiveInteger,
  isNullableString,
  isNonNegativeInteger,
  isPositiveInteger,
  isRecord,
  isString,
} from "~/features/notifications/api/mappers/notification-dto-validator";

export function isNotificationScheduleListResponse(
  value: unknown
): value is NotificationScheduleListResponseDto {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isNotificationScheduleListItem)
  );
}

export function isNotificationScheduleDetail(
  value: unknown
): value is NotificationScheduleDetailDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationId) &&
    isPositiveInteger(value.notificationScheduleId) &&
    isRecord(value.content) &&
    isNotificationPushContent(value.content.push) &&
    isNotificationImportance(value.importance) &&
    isString(value.sendAt) &&
    isNotificationScheduleStatus(value.status) &&
    isNullableNotificationStop(value.stop) &&
    isNotificationCreation(value.creation) &&
    isRecord(value.audienceProgress) &&
    isNonNegativeInteger(value.audienceProgress.totalCount) &&
    isNonNegativeInteger(value.audienceProgress.resolvedCount) &&
    isRecord(value.recipientProgress) &&
    isNonNegativeInteger(value.recipientProgress.count) &&
    (value.recipientProgress.status === "pending" ||
      value.recipientProgress.status === "resolved") &&
    isNotificationDeliveryProgress(value.deliveryProgress)
  );
}

export function isNotificationScheduleResults(
  value: unknown
): value is NotificationScheduleResultsDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationScheduleId) &&
    isRecord(value.recipients) &&
    Array.isArray(value.recipients.items) &&
    value.recipients.items.every(isNotificationResultRecipient) &&
    isRecord(value.recipients.pagination) &&
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
    isPositiveInteger(value.notificationPushDeliveryId) &&
    isPositiveInteger(value.notificationRecipientId) &&
    isNullablePositiveInteger(value.firebaseTokenId) &&
    (value.platform === "ios" || value.platform === "android") &&
    isNotificationPushDeliveryStatus(value.status) &&
    isNonNegativeInteger(value.attemptCount) &&
    isNullableString(value.firstAttemptAt) &&
    isNullableString(value.lastAttemptAt) &&
    isNullableString(value.nextRetryAt) &&
    isNullableString(value.sentAt) &&
    isNullableString(value.failedReason) &&
    isNullableString(value.fcmMessageId)
  );
}

export function isNotificationStopResponse(
  value: unknown
): value is NotificationStopResponseDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationScheduleId) &&
    value.status === "stopped"
  );
}

function isNotificationScheduleListItem(
  value: unknown
): value is NotificationScheduleListItemDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notificationId) &&
    isPositiveInteger(value.notificationScheduleId) &&
    isRecord(value.content) &&
    isNotificationPushContent(value.content.push) &&
    isNotificationImportance(value.importance) &&
    isString(value.sendAt) &&
    isNotificationScheduleStatus(value.status) &&
    isNullableNotificationStop(value.stop) &&
    isNotificationCreation(value.creation)
  );
}

function isNotificationResultRecipient(value: unknown) {
  return (
    isRecord(value) &&
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
    isPositiveInteger(value.notificationPushDeliveryId) &&
    (value.platform === "ios" || value.platform === "android") &&
    isNotificationPushDeliveryStatus(value.status) &&
    isNonNegativeInteger(value.attemptCount) &&
    isNullableString(value.lastAttemptAt) &&
    isNullableString(value.sentAt)
  );
}

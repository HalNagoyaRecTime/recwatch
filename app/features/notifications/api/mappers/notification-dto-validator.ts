import {
  NOTIFICATION_AUDIENCE_TYPES,
  NOTIFICATION_CREATION_METHODS,
  NOTIFICATION_IMPORTANCE_LEVELS,
  NOTIFICATION_PLATFORMS,
  NOTIFICATION_PUSH_DELIVERY_STATUSES,
  NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES,
  NOTIFICATION_SCHEDULE_STATUSES,
  NOTIFICATION_SOURCE_TYPES,
  NOTIFICATION_STOP_REASONS,
  NOTIFICATION_TARGET_AUDIENCE_TYPES,
  type NotificationAudienceDto,
  type NotificationAudienceItemDto,
  type NotificationContentDto,
  type NotificationCreationDto,
  type NotificationImportanceDto,
  type NotificationPlatformDto,
  type NotificationPushContentDto,
  type NotificationPushDeliveryStatusDto,
  type NotificationRecipientPushSummaryDto,
  type NotificationRecipientResolutionStatusDto,
  type NotificationScheduleAudienceDto,
  type NotificationScheduleStatusDto,
  type NotificationStopDto,
  type NotificationUserReferenceDto,
} from "~/features/notifications/api/dto/notification-common-dto";
import type { NotificationDeliveryProgressDto } from "~/features/notifications/api/dto/notification-schedule-dto";

function isOneOf<T extends string>(
  value: unknown,
  values: readonly T[]
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

export function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

export function isNullablePositiveInteger(
  value: unknown
): value is number | null {
  return value === null || isPositiveInteger(value);
}

export function isNotificationScheduleStatus(
  value: unknown
): value is NotificationScheduleStatusDto {
  return isOneOf(value, NOTIFICATION_SCHEDULE_STATUSES);
}

export function isNotificationPushDeliveryStatus(
  value: unknown
): value is NotificationPushDeliveryStatusDto {
  return isOneOf(value, NOTIFICATION_PUSH_DELIVERY_STATUSES);
}

export function isNotificationImportance(
  value: unknown
): value is NotificationImportanceDto {
  return isOneOf(value, NOTIFICATION_IMPORTANCE_LEVELS);
}

export function isNotificationPlatform(
  value: unknown
): value is NotificationPlatformDto {
  return isOneOf(value, NOTIFICATION_PLATFORMS);
}

export function isNotificationRecipientResolutionStatus(
  value: unknown
): value is NotificationRecipientResolutionStatusDto {
  return isOneOf(value, NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES);
}

export function isNotificationUserReference(
  value: unknown
): value is NotificationUserReferenceDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.userId) &&
    isString(value.userName)
  );
}

export function isNullableNotificationUserReference(
  value: unknown
): value is NotificationUserReferenceDto | null {
  return value === null || isNotificationUserReference(value);
}

export function isNotificationPushContent(
  value: unknown
): value is NotificationPushContentDto {
  return isRecord(value) && isString(value.title) && isString(value.body);
}

export function isNotificationContent(
  value: unknown
): value is NotificationContentDto {
  return (
    isRecord(value) &&
    isNotificationPushContent(value.push) &&
    isNotificationPushContent(value.detail)
  );
}

export function isNotificationCreation(
  value: unknown
): value is NotificationCreationDto {
  if (!isRecord(value)) return false;

  if (value.method === NOTIFICATION_CREATION_METHODS[0]) {
    return (
      isNullableNotificationUserReference(value.user) && value.source === null
    );
  }

  return (
    value.method === NOTIFICATION_CREATION_METHODS[1] &&
    value.user === null &&
    isRecord(value.source) &&
    value.source.type === NOTIFICATION_SOURCE_TYPES[0] &&
    isPositiveInteger(value.source.id) &&
    isNullableString(value.source.label)
  );
}

export function isNotificationAudienceItem(
  value: unknown
): value is NotificationAudienceItemDto {
  if (!isRecord(value)) return false;

  if (value.type === NOTIFICATION_AUDIENCE_TYPES[0]) {
    return Object.keys(value).length === 1;
  }

  return (
    isOneOf(value.type, NOTIFICATION_TARGET_AUDIENCE_TYPES) &&
    Object.keys(value).length === 3 &&
    isPositiveInteger(value.targetId) &&
    isNullableString(value.label)
  );
}

export function isNotificationAudience(
  value: unknown
): value is NotificationAudienceDto {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isNotificationAudienceItem)
  );
}

export function isNotificationScheduleAudience(
  value: unknown
): value is NotificationScheduleAudienceDto {
  if (!isNotificationAudience(value)) return false;

  const recipientResolution = (value as Record<string, unknown>)
    .recipientResolution;

  return (
    isRecord(recipientResolution) &&
    isNotificationRecipientResolutionStatus(recipientResolution.status) &&
    isNonNegativeInteger(recipientResolution.resolvedCount)
  );
}

export function isNotificationStop(
  value: unknown
): value is NotificationStopDto {
  return (
    isRecord(value) &&
    isOneOf(value.reason, NOTIFICATION_STOP_REASONS) &&
    isString(value.stoppedAt) &&
    isNullableNotificationUserReference(value.stoppedBy)
  );
}

export function isNullableNotificationStop(
  value: unknown
): value is NotificationStopDto | null {
  return value === null || isNotificationStop(value);
}

export function isNotificationRecipientPushSummary(
  value: unknown
): value is NotificationRecipientPushSummaryDto {
  return (
    isRecord(value) &&
    isNonNegativeInteger(value.totalCount) &&
    isNonNegativeInteger(value.successCount) &&
    isNonNegativeInteger(value.failedCount) &&
    isNonNegativeInteger(value.noPushTargetCount)
  );
}

export function isNotificationDeliveryProgress(
  value: unknown
): value is NotificationDeliveryProgressDto {
  return (
    isRecord(value) &&
    isNonNegativeInteger(value.totalCount) &&
    isNonNegativeInteger(value.pendingCount) &&
    isNonNegativeInteger(value.sendingCount) &&
    isNonNegativeInteger(value.retryWaitCount) &&
    isNonNegativeInteger(value.sentCount) &&
    isNonNegativeInteger(value.failedCount) &&
    isNonNegativeInteger(value.stoppedCount)
  );
}

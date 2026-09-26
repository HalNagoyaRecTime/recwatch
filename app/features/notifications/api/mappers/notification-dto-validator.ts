import type {
  NotificationAudienceDto,
  NotificationAudienceItemDto,
  NotificationContentDto,
  NotificationCreationDto,
  NotificationPushContentDto,
  NotificationPushDeliveryStatusDto,
  NotificationRecipientPushSummaryDto,
  NotificationScheduleStatusDto,
  NotificationStopDto,
  NotificationUserReferenceDto,
} from "~/features/notifications/api/dto/notification-common-dto";
import type { NotificationDeliveryProgressDto } from "~/features/notifications/api/dto/notification-schedule-dto";

const scheduleStatuses = new Set<NotificationScheduleStatusDto>([
  "scheduled",
  "resolving",
  "sending",
  "completed",
  "failed",
  "stopped",
]);

const deliveryStatuses = new Set<NotificationPushDeliveryStatusDto>([
  "pending",
  "sending",
  "retry_wait",
  "sent",
  "failed",
  "stopped",
]);

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
  return (
    typeof value === "string" &&
    scheduleStatuses.has(value as NotificationScheduleStatusDto)
  );
}

export function isNotificationPushDeliveryStatus(
  value: unknown
): value is NotificationPushDeliveryStatusDto {
  return (
    typeof value === "string" &&
    deliveryStatuses.has(value as NotificationPushDeliveryStatusDto)
  );
}

export function isNotificationImportance(
  value: unknown
): value is "low" | "normal" | "high" {
  return value === "low" || value === "normal" || value === "high";
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

  if (value.method === "manual") {
    return (
      isNullableNotificationUserReference(value.user) && value.source === null
    );
  }

  return (
    value.method === "automatic" &&
    value.user === null &&
    isRecord(value.source) &&
    value.source.type === "gathering" &&
    isPositiveInteger(value.source.id) &&
    isNullableString(value.source.label)
  );
}

export function isNotificationAudienceItem(
  value: unknown
): value is NotificationAudienceItemDto {
  if (!isRecord(value)) return false;

  if (value.type === "all") {
    return Object.keys(value).length === 1;
  }

  return (
    (value.type === "class_room" ||
      value.type === "gathering" ||
      value.type === "event" ||
      value.type === "user") &&
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
    value.items.every(isNotificationAudienceItem) &&
    isRecord(value.recipientResolution) &&
    (value.recipientResolution.status === "pending" ||
      value.recipientResolution.status === "resolved") &&
    isNonNegativeInteger(value.recipientResolution.resolvedCount)
  );
}

export function isNotificationStop(
  value: unknown
): value is NotificationStopDto {
  return (
    isRecord(value) &&
    (value.reason === "manual" || value.reason === "source_deleted") &&
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

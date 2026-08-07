import type {
  AdminNotificationAudienceResponse,
  AdminNotificationDeliverySummaryResponse,
  AdminNotificationListResponse,
  AdminNotificationResponse,
} from "~/features/notifications/api/dto/admin-notification-management-api-dto";

export function isAdminNotificationListResponse(
  value: unknown
): value is AdminNotificationListResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.notifications) &&
    value.notifications.every(isAdminNotificationResponse) &&
    isNonNegativeInteger(value.total) &&
    isPositiveInteger(value.limit) &&
    isNonNegativeInteger(value.offset)
  );
}

export function isAdminNotificationResponse(
  value: unknown
): value is AdminNotificationResponse {
  if (!isRecord(value)) return false;

  return (
    isPositiveInteger(value.notification_id) &&
    typeof value.notification_type === "string" &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    typeof value.scheduled_at === "string" &&
    isNullablePositiveInteger(value.related_event_id) &&
    isNullableString(value.related_event_name) &&
    isNullablePositiveInteger(value.created_user_id) &&
    isNullableString(value.creator_name) &&
    isPositiveInteger(value.recipient_count) &&
    isAdminNotificationAudience(value.audience) &&
    isAdminNotificationDeliverySummary(value.delivery_summary) &&
    value.recipient_count === value.audience.recipient_count &&
    value.recipient_count === value.delivery_summary.total &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isAdminNotificationAudience(
  value: unknown
): value is AdminNotificationAudienceResponse {
  if (!isRecord(value) || !isPositiveInteger(value.recipient_count)) {
    return false;
  }

  switch (value.type) {
    case "all":
    case "resolved_recipients":
      return true;
    case "class_room":
      return isPositiveInteger(value.class_room_id);
    case "gathering":
      return isPositiveInteger(value.gathering_id);
    case "event_participants":
      return isPositiveInteger(value.event_id);
    default:
      return false;
  }
}

function isAdminNotificationDeliverySummary(
  value: unknown
): value is AdminNotificationDeliverySummaryResponse {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.total) ||
    !isNonNegativeInteger(value.draft) ||
    !isNonNegativeInteger(value.sending) ||
    !isNonNegativeInteger(value.sent) ||
    !isNonNegativeInteger(value.failed)
  ) {
    return false;
  }

  return (
    value.draft + value.sending + value.sent + value.failed === value.total
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isNullablePositiveInteger(value: unknown) {
  return value === null || isPositiveInteger(value);
}

function isNullableString(value: unknown) {
  return value === null || typeof value === "string";
}

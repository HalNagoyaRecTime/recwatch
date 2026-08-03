import { NotificationManagementError } from "~/features/notifications/model/notification-management-error";
import type {
  ManagedNotification,
  ManagedNotificationPage,
  ManagedNotificationStatus,
  NotificationDeliverySummary,
} from "~/features/notifications/model/managed-notification";
import type {
  AdminNotificationAudienceResponse,
  AdminNotificationDeliverySummaryResponse,
  AdminNotificationListResponse,
  AdminNotificationResponse,
} from "~/features/notifications/api/dto/admin-notification-management-api-dto";

export function toManagedNotificationPage(
  response: unknown
): ManagedNotificationPage {
  if (!isAdminNotificationListResponse(response)) {
    throw new NotificationManagementError("unexpected");
  }

  return {
    notifications: response.notifications.map(toManagedNotification),
    total: response.total,
    limit: response.limit,
    offset: response.offset,
  };
}

export function toManagedNotification(response: unknown): ManagedNotification {
  if (!isAdminNotificationResponse(response)) {
    throw new NotificationManagementError("unexpected");
  }

  return {
    id: response.notification_id,
    title: response.title,
    body: response.body,
    audienceName: toAudienceName(response.audience),
    audience: toManagedAudience(response.audience),
    recipientCount: response.recipient_count,
    scheduledAt: response.scheduled_at,
    creatorName: response.creator_name ?? "-",
    relatedEventId: response.related_event_id,
    relatedEventName: response.related_event_name,
    status: deriveStatus(response.delivery_summary),
    deliverySummary: { ...response.delivery_summary },
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
}

function deriveStatus(
  summary: NotificationDeliverySummary
): ManagedNotificationStatus {
  if (summary.failed > 0) return "failed";
  if (summary.sending > 0) return "sending";
  if (summary.sent === summary.total) return "sent";
  if (summary.draft === summary.total) return "draft";
  return "sending";
}

function toAudienceName(audience: AdminNotificationAudienceResponse) {
  return audience.type === "event_participants"
    ? `競技参加者（${audience.recipient_count}名）`
    : `配信対象者（${audience.recipient_count}名）`;
}

function toManagedAudience(audience: AdminNotificationAudienceResponse) {
  switch (audience.type) {
    case "all":
      return { type: "all" as const };
    case "class_room":
      return {
        type: "class_room" as const,
        classRoomId: audience.class_room_id,
      };
    case "gathering":
      return { type: "gathering" as const, gatheringId: audience.gathering_id };
    case "event_participants":
      return {
        type: "event_participants" as const,
        eventId: audience.event_id,
      };
    case "resolved_recipients":
      return { type: "resolved_recipients" as const };
  }
}

function isAdminNotificationListResponse(
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

function isAdminNotificationResponse(
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
    isAudience(value.audience) &&
    isDeliverySummary(value.delivery_summary) &&
    value.recipient_count === value.audience.recipient_count &&
    value.recipient_count === value.delivery_summary.total &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isAudience(
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

function isDeliverySummary(
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

import { NotificationManagementError } from "~/features/notifications/api/contracts/errors/notification-management-error";
import type { ManagedNotificationPage } from "~/features/notifications/api/contracts/notification-management-api";
import type {
  ManagedNotification,
  ManagedNotificationStatus,
  NotificationDeliverySummary,
} from "~/features/notifications/model/notification";
import type { AdminNotificationAudienceResponse } from "~/features/notifications/api/dto/admin-notification-management-api-dto";
import {
  isAdminNotificationListResponse,
  isAdminNotificationResponse,
} from "~/features/notifications/api/mappers/admin-notification-management-response-validator";

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
    ? `イベント参加者（${audience.recipient_count}名）`
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

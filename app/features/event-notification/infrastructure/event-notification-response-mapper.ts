import { EventNotificationError } from "../application/event-notification-error";
import type {
  EventNotificationStatus,
  EventNotificationSummary,
  EventPatchResult,
} from "../model/event-notification";
import type {
  EventNotificationSummaryResponse,
  EventResponse,
  NotificationScheduleResponse,
  PatchEventResponse,
} from "./event-notification-api-dto";
import { toDisplayTime } from "./event-time-mapper";

export function toEventPatchResult(response: unknown): EventPatchResult {
  if (!isPatchEventResponse(response)) {
    throw new EventNotificationError("unexpected");
  }

  return {
    event: {
      id: response.event.event_id,
      name: response.event.event_name,
      ruleText: response.event.rule_text,
      venue: response.event.venue,
      startTime: toDisplayTime(response.event.start_time),
      endTime: toDisplayTime(response.event.end_time),
      createdAt: response.event.created_at,
      updatedAt: response.event.updated_at,
    },
    notificationEnabled: response.notification_enabled,
    draftNotificationCount: response.notification_schedules.length,
  };
}

export function toEventNotificationSummary(
  response: unknown
): EventNotificationSummary {
  if (!isEventNotificationSummaryResponse(response)) {
    throw new EventNotificationError("unexpected");
  }

  return {
    eventId: response.event_id,
    scheduledAt: response.scheduled_at,
    total: response.total,
    draft: response.draft,
    sending: response.sending,
    sent: response.sent,
    failed: response.failed,
    status: deriveStatus(response),
    hasUpcomingNotification: response.draft > 0 || response.sending > 0,
  };
}

function deriveStatus(
  summary: EventNotificationSummaryResponse
): EventNotificationStatus {
  if (summary.total === 0) return "none";
  if (summary.failed > 0) return "failed";
  if (summary.sending > 0) return "sending";
  if (summary.sent === summary.total) return "sent";
  if (summary.draft === summary.total) return "draft";
  return "sending";
}

function isPatchEventResponse(value: unknown): value is PatchEventResponse {
  return (
    isRecord(value) &&
    isEventResponse(value.event) &&
    typeof value.notification_enabled === "boolean" &&
    Array.isArray(value.notification_schedules) &&
    value.notification_schedules.every(isDraftNotificationSchedule)
  );
}

function isEventResponse(value: unknown): value is EventResponse {
  return (
    isRecord(value) &&
    isPositiveInteger(value.event_id) &&
    typeof value.event_name === "string" &&
    (value.rule_text === null || typeof value.rule_text === "string") &&
    typeof value.venue === "string" &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isDraftNotificationSchedule(
  value: unknown
): value is NotificationScheduleResponse {
  return (
    isRecord(value) &&
    isPositiveInteger(value.notification_schedule_id) &&
    value.send_status === "draft" &&
    typeof value.send_at === "string"
  );
}

function isEventNotificationSummaryResponse(
  value: unknown
): value is EventNotificationSummaryResponse {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.event_id) ||
    !(value.scheduled_at === null || typeof value.scheduled_at === "string") ||
    !isNonNegativeInteger(value.total) ||
    !isNonNegativeInteger(value.draft) ||
    !isNonNegativeInteger(value.sending) ||
    !isNonNegativeInteger(value.sent) ||
    !isNonNegativeInteger(value.failed)
  ) {
    return false;
  }

  return (
    value.draft + value.sending + value.sent + value.failed === value.total &&
    ((value.total === 0 && value.scheduled_at === null) ||
      (value.total > 0 && typeof value.scheduled_at === "string"))
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

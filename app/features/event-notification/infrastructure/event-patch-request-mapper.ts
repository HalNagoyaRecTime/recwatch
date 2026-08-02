import { EventNotificationError } from "../application/event-notification-error";
import type { EventPatch } from "../model/event-notification";
import type { PatchEventRequest } from "./event-notification-api-dto";
import { toApiTime } from "./event-time-mapper";

export function toPatchEventRequest(patch: EventPatch): PatchEventRequest {
  if (!Number.isSafeInteger(patch.eventId) || patch.eventId <= 0) {
    throw new EventNotificationError("invalid_request");
  }

  const request: PatchEventRequest = {
    ...(patch.name !== undefined ? { event_name: patch.name.trim() } : {}),
    ...(patch.ruleText !== undefined
      ? { rule_text: patch.ruleText?.trim() || null }
      : {}),
    ...(patch.venue !== undefined ? { venue: patch.venue.trim() } : {}),
    ...(patch.startTime !== undefined
      ? { start_time: toApiTime(patch.startTime) }
      : {}),
    ...(patch.endTime !== undefined
      ? { end_time: toApiTime(patch.endTime) }
      : {}),
    ...(patch.notificationEnabled !== undefined
      ? { notification_enabled: patch.notificationEnabled }
      : {}),
  };

  if (
    Object.keys(request).length === 0 ||
    request.event_name === "" ||
    request.venue === "" ||
    (request.start_time !== undefined &&
      request.end_time !== undefined &&
      request.start_time >= request.end_time)
  ) {
    throw new EventNotificationError("invalid_request");
  }

  return request;
}

import type { EventNotificationSummary } from "~/features/event-notification/model/event-notification";
import { toDisplayTime } from "~/features/event-notification/infrastructure/event-time-mapper";

import type { ManagedSchedule, SchedulePublication } from "../model/schedule";
import type { EventApiDto } from "./event-management-api-dto";

function scheduledTime(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(date);
}

function toPublication(summary: EventNotificationSummary): SchedulePublication {
  if (summary.status === "draft") {
    const publishAt = scheduledTime(summary.scheduledAt);
    return publishAt ? { mode: "scheduled", publishAt } : { mode: "none" };
  }

  if (summary.status === "none") {
    return { mode: "none" };
  }

  return { mode: summary.status };
}

export function toManagedSchedule(
  event: EventApiDto,
  summary: EventNotificationSummary
): ManagedSchedule {
  return {
    id: String(event.event_id),
    startTime: toDisplayTime(event.start_time),
    endTime: toDisplayTime(event.end_time),
    venueName: event.venue,
    gatheringSpotName: null,
    relatedEventName: event.event_name,
    notes: event.rule_text,
    publication: toPublication(summary),
    notificationEnabled: summary.draft > 0,
  };
}

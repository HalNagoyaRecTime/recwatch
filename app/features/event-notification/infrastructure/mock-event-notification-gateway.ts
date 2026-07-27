import type { EventNotificationGateway } from "../application/event-notification-gateway";
import { EventNotificationError } from "../application/event-notification-error";
import type {
  EventNotificationSummary,
  EventPatchResult,
} from "../model/event-notification";

const summaries = new Map<number, EventNotificationSummary>();
const events = new Map<number, EventPatchResult["event"]>();

export const mockEventNotificationGateway: EventNotificationGateway = {
  async patchEvent(patch): Promise<EventPatchResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    if (patch.eventId <= 0) {
      throw new EventNotificationError("not_found");
    }

    const currentEvent = events.get(patch.eventId) ?? {
      id: patch.eventId,
      name: "走れ！〇人〇脚！",
      ruleText: null,
      venue: "コートA",
      startTime: "09:10",
      endTime: "10:10",
      createdAt: "2026-11-07T08:00:00+09:00",
      updatedAt: "2026-11-07T08:00:00+09:00",
    };
    const currentSummary =
      summaries.get(patch.eventId) ?? createEmptySummary(patch.eventId);
    const notificationEnabled =
      patch.notificationEnabled ?? currentSummary.hasUpcomingNotification;
    const refreshNotification =
      patch.name !== undefined ||
      patch.startTime !== undefined ||
      patch.notificationEnabled !== undefined;
    const nextSummary = refreshNotification
      ? createDraftSummary(patch.eventId, notificationEnabled)
      : currentSummary;
    summaries.set(patch.eventId, nextSummary);

    const event = {
      ...currentEvent,
      name: patch.name ?? currentEvent.name,
      ruleText:
        patch.ruleText === undefined ? currentEvent.ruleText : patch.ruleText,
      venue: patch.venue ?? currentEvent.venue,
      startTime: patch.startTime ?? currentEvent.startTime,
      endTime: patch.endTime ?? currentEvent.endTime,
      updatedAt: new Date().toISOString(),
    };
    events.set(patch.eventId, event);

    return {
      event,
      notificationEnabled,
      draftNotificationCount: nextSummary.draft,
    };
  },

  async getNotificationSummary(eventId) {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    return summaries.get(eventId) ?? createEmptySummary(eventId);
  },
};

function createDraftSummary(
  eventId: number,
  enabled: boolean
): EventNotificationSummary {
  if (!enabled) return createEmptySummary(eventId);

  return {
    eventId,
    scheduledAt: "2026-11-07T08:55:00+09:00",
    total: 30,
    draft: 30,
    sending: 0,
    sent: 0,
    failed: 0,
    status: "draft",
    hasUpcomingNotification: true,
  };
}

function createEmptySummary(eventId: number): EventNotificationSummary {
  return {
    eventId,
    scheduledAt: null,
    total: 0,
    draft: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    status: "none",
    hasUpcomingNotification: false,
  };
}

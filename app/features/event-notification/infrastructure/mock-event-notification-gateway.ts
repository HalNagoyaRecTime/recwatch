import type { EventNotificationGateway } from "../application/event-notification-gateway";
import { EventNotificationError } from "../application/event-notification-error";
import type {
  EventNotificationStatus,
  EventNotificationSummary,
  EventPatchResult,
} from "../model/event-notification";

export function createMockEventNotificationGateway(
  initialSummaries: EventNotificationSummary[] = []
): EventNotificationGateway {
  const summaries = new Map(
    initialSummaries.map((summary) => [summary.eventId, { ...summary }])
  );
  const events = new Map<number, EventPatchResult["event"]>();

  return {
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
        patch.notificationEnabled ?? currentSummary.draft > 0;
      const refreshNotification =
        patch.name !== undefined ||
        patch.startTime !== undefined ||
        patch.notificationEnabled !== undefined;
      const nextSummary = refreshNotification
        ? replaceDraftSummary(currentSummary, notificationEnabled)
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
}

export const mockEventNotificationGateway =
  createMockEventNotificationGateway();

function replaceDraftSummary(
  current: EventNotificationSummary,
  enabled: boolean
): EventNotificationSummary {
  const draft = enabled ? 30 : 0;
  const total = draft + current.sending + current.sent + current.failed;
  const scheduledAt = enabled
    ? "2026-11-07T08:55:00+09:00"
    : total === 0
      ? null
      : current.scheduledAt;
  const summary = {
    ...current,
    scheduledAt,
    total,
    draft,
  };

  return {
    ...summary,
    status: deriveStatus(summary),
    hasUpcomingNotification: summary.draft > 0 || summary.sending > 0,
  };
}

function deriveStatus(
  summary: Omit<EventNotificationSummary, "status" | "hasUpcomingNotification">
): EventNotificationStatus {
  if (summary.total === 0) return "none";
  if (summary.failed > 0) return "failed";
  if (summary.sending > 0) return "sending";
  if (summary.sent === summary.total) return "sent";
  if (summary.draft === summary.total) return "draft";
  return "sending";
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

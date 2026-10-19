import { describe, expect, it } from "vitest";

import type { EventNotificationSummary } from "~/features/event-notification/model/event-notification";

import type { EventApiDto } from "./event-management-api-dto";
import { toManagedSchedule } from "./event-management-response-mapper";

const event: EventApiDto = {
  event_id: 12,
  event_name: "リレー",
  rule_text: null,
  venue: "コートA",
  start_time: "0910",
  end_time: "1010",
};

function createSummary(
  overrides: Partial<EventNotificationSummary>
): EventNotificationSummary {
  return {
    eventId: 12,
    scheduledAt: "2026-11-07T08:55:00+09:00",
    total: 2,
    draft: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    status: "none",
    hasUpcomingNotification: false,
    ...overrides,
  };
}

describe("toManagedSchedule", () => {
  it.each([
    ["送信済み", { draft: 1, sent: 1, status: "sent" as const }],
    ["送信失敗", { draft: 1, failed: 1, status: "failed" as const }],
  ])("%s履歴とdraftが混在していても通知ONとして扱う", (_, summaryOverrides) => {
    expect(
      toManagedSchedule(event, createSummary(summaryOverrides))
        .notificationEnabled
    ).toBe(true);
  });
});

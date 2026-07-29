import { describe, expect, it, vi } from "vitest";

import type { EventNotificationGateway } from "~/features/event-notification/application/event-notification-gateway";

import type { ManagedSchedule } from "../model/schedule";
import { createEventScheduleUpdater } from "./create-event-schedule-updater";

const event: ManagedSchedule = {
  id: "12",
  startTime: "09:10",
  endTime: "10:10",
  venueName: "コートA",
  gatheringSpotName: null,
  relatedEventName: "リレー",
  notes: null,
  publication: { mode: "scheduled", publishAt: "08:55" },
  notificationEnabled: true,
};

function createGateway(patchEvent = vi.fn()) {
  return {
    patchEvent,
    getNotificationSummary: vi.fn(),
  } as EventNotificationGateway;
}

describe("createEventScheduleUpdater", () => {
  it("変更されたイベント情報だけをPATCHする", async () => {
    const patchEvent = vi.fn().mockResolvedValue(undefined);
    const submitter = createEventScheduleUpdater(
      event,
      createGateway(patchEvent)
    );

    await submitter.submit({
      eventName: event.relatedEventName ?? "",
      startTime: "09:20",
      endTime: event.endTime,
      venue: "コートB",
      notes: "",
      notificationEnabled: event.notificationEnabled,
    });

    expect(patchEvent).toHaveBeenCalledWith({
      eventId: 12,
      startTime: "09:20",
      venue: "コートB",
      notificationEnabled: true,
    });
  });

  it("変更がない場合も現在の通知設定をPATCHする", async () => {
    const patchEvent = vi.fn();
    const submitter = createEventScheduleUpdater(
      event,
      createGateway(patchEvent)
    );

    await submitter.submit({
      eventName: event.relatedEventName ?? "",
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venueName ?? "",
      notes: "",
      notificationEnabled: event.notificationEnabled,
    });

    expect(patchEvent).toHaveBeenCalledWith({
      eventId: 12,
      notificationEnabled: true,
    });
  });
});

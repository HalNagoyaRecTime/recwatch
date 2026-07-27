import { describe, expect, it } from "vitest";

import { mockScheduleFormOptions } from "~/features/schedule-editor/infrastructure/mock-schedule-form-options";

import type { ManagedSchedule } from "../model/schedule";
import { mapScheduleToDraft } from "./map-schedule-to-draft";

describe("mapScheduleToDraft", () => {
  it("管理対象のスケジュールを編集フォームのDraftへ明示的に変換する", () => {
    const schedule: ManagedSchedule = {
      id: "schedule-1",
      type: "competition",
      startTime: "09:10",
      endTime: "10:10",
      venueName: mockScheduleFormOptions.venues[0].name,
      gatheringSpotName: mockScheduleFormOptions.gatheringSpots[0].name,
      relatedEventName: mockScheduleFormOptions.events[0].name,
      notes: "備考",
      publication: { mode: "immediate" },
      notificationEnabled: true,
    };

    expect(mapScheduleToDraft(schedule, mockScheduleFormOptions)).toEqual({
      type: "competition",
      startTime: "09:10",
      endTime: "10:10",
      venueId: mockScheduleFormOptions.venues[0].id,
      gatheringSpotId: mockScheduleFormOptions.gatheringSpots[0].id,
      eventId: mockScheduleFormOptions.events[0].id,
      notes: "備考",
      notificationEnabled: true,
    });
  });
});

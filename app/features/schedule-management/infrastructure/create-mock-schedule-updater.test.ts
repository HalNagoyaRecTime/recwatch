import { describe, expect, it } from "vitest";

import { mockScheduleFormOptions } from "~/features/schedule-editor/infrastructure/mock-schedule-form-options";

import { createMockScheduleUpdater } from "./create-mock-schedule-updater";
import { mockScheduleManagementStore } from "./mock-schedule-management-store";

describe("createMockScheduleUpdater", () => {
  it("編集Draftを管理画面のスケジュールへ反映する", async () => {
    const submitter = createMockScheduleUpdater(
      "schedule-001",
      mockScheduleFormOptions
    );

    await submitter.submit({
      type: "opening",
      startTime: "08:40",
      endTime: "09:10",
      venueId: mockScheduleFormOptions.venues[0].id,
      gatheringSpotId: "",
      eventId: "",
      notes: "開始時刻を変更",
      notificationEnabled: true,
    });

    const updated = await mockScheduleManagementStore.get("schedule-001");
    expect(updated).toMatchObject({
      startTime: "08:40",
      endTime: "09:10",
      venueName: mockScheduleFormOptions.venues[0].name,
      notes: "開始時刻を変更",
      notificationEnabled: true,
    });
  });
});

import { describe, expect, it } from "vitest";

import { createMockScheduleUpdater } from "./create-mock-schedule-updater";
import { mockScheduleManagementStore } from "./mock-schedule-management-store";

describe("createMockScheduleUpdater", () => {
  it("編集Draftを管理画面のスケジュールへ反映する", async () => {
    const submitter = createMockScheduleUpdater("schedule-001");

    await submitter.submit({
      eventName: "開会式",
      startTime: "08:40",
      endTime: "09:10",
      venue: "体育館",
      notes: "開始時刻を変更",
      notificationEnabled: true,
    });

    const updated = await mockScheduleManagementStore.get("schedule-001");
    expect(updated).toMatchObject({
      startTime: "08:40",
      endTime: "09:10",
      venueName: "体育館",
      relatedEventName: "開会式",
      notes: "開始時刻を変更",
      notificationEnabled: true,
    });
  });
});

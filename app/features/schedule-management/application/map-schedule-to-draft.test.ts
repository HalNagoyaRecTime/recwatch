import { describe, expect, it } from "vitest";

import type { ManagedSchedule } from "../model/schedule";
import { mapScheduleToDraft } from "./map-schedule-to-draft";

describe("mapScheduleToDraft", () => {
  it("管理対象のスケジュールを編集フォームのDraftへ明示的に変換する", () => {
    const schedule: ManagedSchedule = {
      id: "schedule-1",
      startTime: "09:10",
      endTime: "10:10",
      venueName: "コートA",
      gatheringSpotName: null,
      relatedEventName: "走れ！〇人〇脚！",
      notes: "備考",
      publication: { mode: "sent" },
      notificationEnabled: true,
    };

    expect(mapScheduleToDraft(schedule)).toEqual({
      eventName: schedule.relatedEventName,
      startTime: "09:10",
      endTime: "10:10",
      venue: schedule.venueName,
      notes: "備考",
      notificationEnabled: true,
    });
  });
});

import { describe, expect, it } from "vitest";

import type { ManagedSchedule } from "./schedule";
import { filterSchedules } from "./schedule-search";

const schedules: ManagedSchedule[] = [
  {
    id: "schedule-1",
    type: "opening",
    startTime: "08:30",
    endTime: "09:00",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: null,
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: false,
  },
  {
    id: "schedule-2",
    type: "competition",
    startTime: "09:10",
    endTime: "10:10",
    venueName: "コートB",
    gatheringSpotName: null,
    relatedEventName: "走れ！〇人〇脚！",
    notes: "午前の競技",
    publication: { mode: "immediate" },
    notificationEnabled: true,
  },
];

describe("filterSchedules", () => {
  it("種別・関連イベント・場所を対象に検索する", () => {
    expect(filterSchedules(schedules, "開会式")).toEqual([schedules[0]]);
    expect(filterSchedules(schedules, "〇人〇脚")).toEqual([schedules[1]]);
    expect(filterSchedules(schedules, "コートB")).toEqual([schedules[1]]);
  });

  it("空白だけの検索では全件を返す", () => {
    expect(filterSchedules(schedules, "  ")).toEqual(schedules);
  });
});

import type { ScheduleFormOptions } from "../model/schedule-option";

export const mockScheduleFormOptions: ScheduleFormOptions = {
  venues: [
    { id: "court-a", name: "コートA" },
    { id: "court-b", name: "コートB" },
    { id: "gym", name: "体育館" },
    { id: "field", name: "グラウンド" },
  ],
  gatheringSpots: [
    { id: "spot-a", name: "集合場所A" },
    { id: "spot-b", name: "集合場所B" },
    { id: "spot-c", name: "集合場所C" },
    { id: "spot-d", name: "集合場所D" },
  ],
  events: [
    { id: "three-legged-race", name: "走れ！〇人〇脚！" },
    { id: "tug-of-war", name: "ガチンコ綱引き" },
    { id: "paper-plane", name: "紙飛行機飛ばし" },
    { id: "jump-rope", name: "大縄跳び" },
  ],
};

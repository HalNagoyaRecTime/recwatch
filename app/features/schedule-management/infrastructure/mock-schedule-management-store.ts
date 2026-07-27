import type { ManagedSchedule } from "../model/schedule";

let schedules: ManagedSchedule[] = [
  {
    id: "schedule-001",
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
    id: "schedule-002",
    type: "competition",
    startTime: "09:10",
    endTime: "10:10",
    venueName: "コートB",
    gatheringSpotName: null,
    relatedEventName: "走れ！〇人〇脚！",
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: true,
  },
  {
    id: "schedule-003",
    type: "gathering",
    startTime: "10:15",
    endTime: "10:25",
    venueName: null,
    gatheringSpotName: "集合場所A",
    relatedEventName: null,
    notes: "ガチンコ綱引き前の集合",
    publication: { mode: "scheduled", publishAt: "09:50" },
    notificationEnabled: true,
  },
  {
    id: "schedule-004",
    type: "competition",
    startTime: "10:30",
    endTime: "11:30",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: "ガチンコ綱引き",
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: true,
  },
  {
    id: "schedule-005",
    type: "competition",
    startTime: "11:40",
    endTime: "12:20",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: "四天王ドッチボール",
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: true,
  },
  {
    id: "schedule-006",
    type: "lunch",
    startTime: "12:20",
    endTime: "13:20",
    venueName: "各自",
    gatheringSpotName: null,
    relatedEventName: null,
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: false,
  },
  {
    id: "schedule-007",
    type: "competition",
    startTime: "13:30",
    endTime: "14:10",
    venueName: "コートB",
    gatheringSpotName: null,
    relatedEventName: "紙飛行機飛ばし",
    notes: null,
    publication: { mode: "scheduled", publishAt: "13:00" },
    notificationEnabled: true,
  },
  {
    id: "schedule-008",
    type: "competition",
    startTime: "14:20",
    endTime: "15:30",
    venueName: "コートC",
    gatheringSpotName: null,
    relatedEventName: "学科別対抗リレー",
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: true,
  },
  {
    id: "schedule-009",
    type: "closing",
    startTime: "15:45",
    endTime: "17:00",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: null,
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: false,
  },
];

function cloneSchedule(schedule: ManagedSchedule): ManagedSchedule {
  return {
    ...schedule,
    publication: { ...schedule.publication },
  };
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export const mockScheduleManagementStore = {
  async list() {
    await wait(250);
    return schedules.map(cloneSchedule);
  },

  async get(scheduleId: string) {
    await wait(150);
    const schedule = schedules.find((item) => item.id === scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return cloneSchedule(schedule);
  },

  async delete(scheduleId: string) {
    await wait(350);

    if (!schedules.some((item) => item.id === scheduleId)) {
      throw new Error("Schedule not found");
    }

    schedules = schedules.filter((item) => item.id !== scheduleId);
  },

  async update(updatedSchedule: ManagedSchedule) {
    await wait(350);

    if (!schedules.some((item) => item.id === updatedSchedule.id)) {
      throw new Error("Schedule not found");
    }

    schedules = schedules.map((item) =>
      item.id === updatedSchedule.id ? cloneSchedule(updatedSchedule) : item
    );

    return cloneSchedule(updatedSchedule);
  },
};

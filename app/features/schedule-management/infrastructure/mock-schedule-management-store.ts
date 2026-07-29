import type { ManagedSchedule } from "../model/schedule";

let schedules: ManagedSchedule[] = [
  {
    id: "schedule-001",
    startTime: "08:30",
    endTime: "09:00",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: "開会式",
    notes: null,
    publication: { mode: "none" },
    notificationEnabled: false,
  },
  {
    id: "schedule-002",
    startTime: "09:10",
    endTime: "10:10",
    venueName: "コートB",
    gatheringSpotName: null,
    relatedEventName: "走れ！〇人〇脚！",
    notes: null,
    publication: { mode: "sent" },
    notificationEnabled: true,
  },
  {
    id: "schedule-003",
    startTime: "10:15",
    endTime: "10:25",
    venueName: null,
    gatheringSpotName: "集合場所A",
    relatedEventName: "集合案内",
    notes: "ガチンコ綱引き前の集合",
    publication: { mode: "scheduled", publishAt: "09:50" },
    notificationEnabled: true,
  },
  {
    id: "schedule-004",
    startTime: "10:30",
    endTime: "11:30",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: "ガチンコ綱引き",
    notes: null,
    publication: { mode: "sent" },
    notificationEnabled: true,
  },
  {
    id: "schedule-005",
    startTime: "11:40",
    endTime: "12:20",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: "四天王ドッチボール",
    notes: null,
    publication: { mode: "sent" },
    notificationEnabled: true,
  },
  {
    id: "schedule-006",
    startTime: "12:20",
    endTime: "13:20",
    venueName: "各自",
    gatheringSpotName: null,
    relatedEventName: "昼休み",
    notes: null,
    publication: { mode: "none" },
    notificationEnabled: false,
  },
  {
    id: "schedule-007",
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
    startTime: "14:20",
    endTime: "15:30",
    venueName: "コートC",
    gatheringSpotName: null,
    relatedEventName: "学科別対抗リレー",
    notes: null,
    publication: { mode: "sent" },
    notificationEnabled: true,
  },
  {
    id: "schedule-009",
    startTime: "15:45",
    endTime: "17:00",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: "閉会式",
    notes: null,
    publication: { mode: "none" },
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

  async cancelNotification(scheduleId: string) {
    await wait(350);

    const schedule = schedules.find((item) => item.id === scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const updatedSchedule: ManagedSchedule = {
      ...schedule,
      publication: { mode: "none" },
      notificationEnabled: false,
    };

    schedules = schedules.map((item) =>
      item.id === scheduleId ? updatedSchedule : item
    );

    return cloneSchedule(updatedSchedule);
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

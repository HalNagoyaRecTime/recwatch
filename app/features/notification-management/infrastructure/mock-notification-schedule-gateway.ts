import type { NotificationScheduleGateway } from "../application/notification-schedule-gateway";
import type { NotificationSchedule } from "../model/notification-schedule";

let schedules: NotificationSchedule[] = [
  {
    id: "schedule-101",
    title: "競技開始時間の変更",
    body: "走れ！〇人〇脚！の開始時間が09:00から09:10に変更になりました。",
    audienceName: "全体",
    scheduledAt: "2026-11-07T09:05:00+09:00",
    creatorName: "HAL 太郎",
    relatedEventName: "走れ！〇人〇脚！",
    relatedScheduleName: "09:10-10:10",
    status: "draft",
  },
  {
    id: "schedule-102",
    title: "集合場所のお知らせ",
    body: "ガチンコ綱引きの集合場所は集合場所Dです。",
    audienceName: "Bグループ",
    scheduledAt: "2026-11-07T10:10:00+09:00",
    creatorName: "HAL 太郎",
    relatedEventName: "ガチンコ綱引き",
    relatedScheduleName: "10:15-10:25",
    status: "sending",
  },
  {
    id: "schedule-103",
    title: "緊急連絡",
    body: "昼休み終了時刻を13:20に変更します。",
    audienceName: "全体",
    scheduledAt: "2026-11-07T13:20:00+09:00",
    creatorName: "HAL 太郎",
    relatedEventName: null,
    relatedScheduleName: "昼休み",
    status: "sent",
  },
  {
    id: "schedule-104",
    title: "紙飛行機飛ばし",
    body: "紙飛行機飛ばしの集合場所は集合場所Cです。",
    audienceName: "Cグループ",
    scheduledAt: "2026-11-07T13:20:00+09:00",
    creatorName: "HAL 太郎",
    relatedEventName: "紙飛行機飛ばし",
    relatedScheduleName: "13:30-14:10",
    status: "failed",
  },
  {
    id: "schedule-105",
    title: "集合時刻変更のお知らせ",
    body: "集合時刻変更のお知らせはキャンセルされました。",
    audienceName: "Aグループ",
    scheduledAt: "2026-11-07T14:30:00+09:00",
    creatorName: "HAL 太郎",
    relatedEventName: "大縄跳び",
    relatedScheduleName: "14:40-15:10",
    status: "canceled",
  },
];

function cloneSchedule(schedule: NotificationSchedule) {
  return { ...schedule };
}

export const mockNotificationScheduleGateway: NotificationScheduleGateway = {
  async list() {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    return schedules.map(cloneSchedule);
  },

  async cancel(scheduleId) {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    const schedule = schedules.find((item) => item.id === scheduleId);

    if (!schedule) {
      throw new Error("Notification schedule not found");
    }

    if (schedule.status !== "draft") {
      throw new Error("Only draft schedules can be canceled");
    }

    const canceledSchedule: NotificationSchedule = {
      ...schedule,
      status: "canceled",
    };
    schedules = schedules.map((item) =>
      item.id === scheduleId ? canceledSchedule : item
    );

    return cloneSchedule(canceledSchedule);
  },
};

import type { NotificationScheduleDetail } from "~/features/notifications/api/contracts/notification-schedule-query-api";

export type MonitorSchedule = NotificationScheduleDetail;

export const monitorDayMs = 24 * 60 * 60 * 1000;
export const monitorCardWidth = 320;
export const monitorColumnGap = 32;
export const monitorCardGap = 20;

export function getMonitorWindow(now: number) {
  return { from: now - monitorDayMs, now, to: now + monitorDayMs };
}

export function isMonitorScheduleVisible(
  schedule: MonitorSchedule,
  now: number
) {
  if (schedule.status === "resolving" || schedule.status === "sending") {
    return true;
  }
  const sendAt = Date.parse(schedule.sendAt);
  const window = getMonitorWindow(now);
  if (schedule.status === "scheduled") {
    return sendAt >= window.now && sendAt <= window.to;
  }
  return sendAt >= window.from && sendAt <= window.now;
}

// APIのstatusは維持し、表示列だけを計算します。
export function getMonitorColumn(status: MonitorSchedule["status"]) {
  switch (status) {
    case "scheduled":
      return 0;
    case "resolving":
      return 1;
    case "sending":
      return 2;
    default:
      return 3;
  }
}

export function layoutMonitorSchedules(
  items: readonly MonitorSchedule[],
  heights: Readonly<Record<string, number>> = {}
) {
  const nextY = [72, 72, 72, 72];
  return [...items]
    .sort(
      (a, b) =>
        Date.parse(a.sendAt) - Date.parse(b.sendAt) ||
        a.notificationScheduleId - b.notificationScheduleId
    )
    .map((schedule) => {
      const id = String(schedule.notificationScheduleId);
      const column = getMonitorColumn(schedule.status);
      const position = {
        x: column * (monitorCardWidth + monitorColumnGap),
        y: nextY[column],
      };
      nextY[column] += (heights[id] ?? 340) + monitorCardGap;
      return { id, position, schedule };
    });
}

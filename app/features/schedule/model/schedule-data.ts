import type { Schedule } from "~/features/schedule/model/schedule";
import { toSchedule } from "~/features/schedule/model/schedule";
import { scheduleApi } from "~/features/schedule/api";

export async function getScheduleData(): Promise<Schedule[]> {
  const response = await scheduleApi.getSchedules();
  if (!response || !Array.isArray(response.schedules)) {
    throw new Error(`予期しない形式のレスポンス:${JSON.stringify(response)}`);
  }
  return response.schedules.map(toSchedule).sort((a, b) => a.order - b.order);
}

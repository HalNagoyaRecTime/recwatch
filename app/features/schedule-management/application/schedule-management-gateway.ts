import type { ManagedSchedule } from "../model/schedule";

export interface ScheduleManagementGateway {
  list(): Promise<ManagedSchedule[]>;
  get(scheduleId: string): Promise<ManagedSchedule>;
  cancelNotification(scheduleId: string): Promise<ManagedSchedule>;
}

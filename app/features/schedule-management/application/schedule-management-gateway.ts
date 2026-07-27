import type { ManagedSchedule } from "../model/schedule";

export interface ScheduleManagementGateway {
  list(): Promise<ManagedSchedule[]>;
  get(scheduleId: string): Promise<ManagedSchedule>;
  delete(scheduleId: string): Promise<void>;
}

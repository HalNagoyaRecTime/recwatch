import type { NotificationSchedule } from "../model/notification-schedule";

export interface NotificationScheduleGateway {
  list(): Promise<NotificationSchedule[]>;
  cancel(scheduleId: string): Promise<NotificationSchedule>;
}

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import { mockScheduleManagementStore } from "./mock-schedule-management-store";

export const mockScheduleManagementGateway: ScheduleManagementGateway = {
  list: () => mockScheduleManagementStore.list(),
  get: (scheduleId) => mockScheduleManagementStore.get(scheduleId),
  cancelNotification: (scheduleId) =>
    mockScheduleManagementStore.cancelNotification(scheduleId),
};

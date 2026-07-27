import { mockScheduleManagementGateway } from "~/features/schedule-management/infrastructure/mock-schedule-management-gateway";
import { ScheduleManagementPage } from "~/features/schedule-management/pages/ScheduleManagementPage";

export function meta() {
  return [{ title: "スケジュール管理 | recwatch" }];
}

export default function ScheduleRoute() {
  return <ScheduleManagementPage gateway={mockScheduleManagementGateway} />;
}

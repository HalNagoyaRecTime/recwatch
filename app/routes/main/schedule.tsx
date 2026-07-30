import { httpScheduleManagementGateway } from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { ScheduleManagementPage } from "~/features/schedule-management/pages/ScheduleManagementPage";

export function meta() {
  return [{ title: "イベント管理 | recwatch" }];
}

export default function ScheduleRoute() {
  return <ScheduleManagementPage gateway={httpScheduleManagementGateway} />;
}

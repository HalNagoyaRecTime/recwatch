import {
  httpEventNotificationGateway,
  httpScheduleManagementGateway,
} from "~/features/schedule-management/infrastructure/http-event-management-dependencies";
import { EventTimeRegistrationPage } from "~/features/schedule-management/pages/EventTimeRegistrationPage";

export function meta() {
  return [{ title: "イベント時間登録 | REC TIME" }];
}

export default function ScheduleCreateRoute() {
  return (
    <EventTimeRegistrationPage
      gateway={httpScheduleManagementGateway}
      eventNotificationGateway={httpEventNotificationGateway}
    />
  );
}

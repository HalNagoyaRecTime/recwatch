import { mockNotificationScheduleGateway } from "~/features/notification-management/infrastructure/mock-notification-schedule-gateway";
import { NotificationManagementPage } from "~/features/notification-management/pages/NotificationManagementPage";

export function meta() {
  return [{ title: "通知管理 | REC TIME" }];
}

export default function NotificationsRoute() {
  return (
    <NotificationManagementPage gateway={mockNotificationScheduleGateway} />
  );
}

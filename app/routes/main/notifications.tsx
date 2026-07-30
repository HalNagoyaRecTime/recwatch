import { mockAdminNotificationManagementGateway } from "~/features/notification-management/infrastructure/mock-admin-notification-management-gateway";
import { NotificationManagementPage } from "~/features/notification-management/pages/NotificationManagementPage";

export function meta() {
  return [{ title: "通知管理 | REC TIME" }];
}

export default function NotificationsRoute() {
  return (
    <NotificationManagementPage
      gateway={mockAdminNotificationManagementGateway}
    />
  );
}

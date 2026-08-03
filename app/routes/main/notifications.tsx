import { httpAdminNotificationManagementGateway } from "~/features/notifications/infrastructure/http-admin-notification-management-gateway";
import { NotificationManagementPage } from "~/features/notifications/pages/NotificationManagementPage";

export function meta() {
  return [{ title: "通知管理 | REC TIME" }];
}

export default function NotificationsRoute() {
  return (
    <NotificationManagementPage
      gateway={httpAdminNotificationManagementGateway}
    />
  );
}

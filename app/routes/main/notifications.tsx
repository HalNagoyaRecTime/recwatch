import { httpAdminNotificationManagementGateway } from "~/features/notifications/infrastructure/http-admin-notification-management-gateway";
import { NotificationManagementPage } from "~/features/notifications/pages/NotificationManagementPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "通知管理 | REC TIME" }];
}

export default function NotificationsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <NotificationManagementPage
          gateway={httpAdminNotificationManagementGateway}
        />
      </PagePadding>
    </PageLayout>
  );
}

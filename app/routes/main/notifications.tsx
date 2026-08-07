import { httpNotificationManagementApi } from "~/features/notifications/api/http/notification-management-api";
import { NotificationManagementPage } from "~/features/notification-management/pages/NotificationManagementPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "通知管理 | REC TIME" }];
}

export default function NotificationsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <NotificationManagementPage api={httpNotificationManagementApi} />
      </PagePadding>
    </PageLayout>
  );
}

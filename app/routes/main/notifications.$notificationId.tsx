import { useParams } from "react-router";

import { createPageTitle } from "~/lib/page-title";
import { httpAdminNotificationQueryApi } from "~/features/notifications/api/http/admin-notification-query-api";
import { httpNotificationPushDeliveryApi } from "~/features/notifications/api/http/notification-push-delivery-api";
import { httpNotificationScheduleQueryApi } from "~/features/notifications/api/http/notification-schedule-query-api";
import { NotificationDetailPage } from "~/features/notifications/pages/NotificationDetailPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("通知詳細") }];
}

export default function NotificationDetailRoute() {
  const notificationId = Number(useParams().notificationId);

  return (
    <PageLayout>
      <PagePadding>
        <NotificationDetailPage
          key={notificationId}
          notificationId={notificationId}
          pushDeliveryApi={httpNotificationPushDeliveryApi}
          queryApi={httpAdminNotificationQueryApi}
          scheduleQueryApi={httpNotificationScheduleQueryApi}
        />
      </PagePadding>
    </PageLayout>
  );
}

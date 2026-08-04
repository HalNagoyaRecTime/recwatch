import { useParams } from "react-router";

import { httpNotificationManagementApi } from "~/features/notifications/api/http/notification-management-api";
import { NotificationDetailPage } from "~/features/notifications/pages/NotificationDetailPage";

export function meta() {
  return [{ title: "通知詳細 | REC TIME" }];
}

export default function NotificationsDetailRoute() {
  const { notificationId } = useParams();

  return (
    <NotificationDetailPage
      api={httpNotificationManagementApi}
      notificationId={Number(notificationId)}
    />
  );
}

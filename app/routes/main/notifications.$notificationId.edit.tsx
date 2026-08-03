import { useParams } from "react-router";

import { httpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";
import { httpNotificationManagementApi } from "~/features/notifications/api/http/notification-management-api";
import { NotificationEditPage } from "~/features/notifications/pages/NotificationEditPage";

export function meta() {
  return [{ title: "通知編集 | REC TIME" }];
}

export default function NotificationsEditRoute() {
  const { notificationId } = useParams();
  const id = Number(notificationId);

  return (
    <NotificationEditPage
      api={httpNotificationManagementApi}
      audienceApi={httpNotificationAudienceApi}
      notificationId={id}
    />
  );
}

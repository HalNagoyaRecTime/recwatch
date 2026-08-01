import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import { httpNotificationAudienceLoader } from "~/features/notifications/infrastructure/http-notification-audience-loader";
import { httpNotificationSubmitter } from "~/features/notifications/infrastructure/http-notification-submitter";

export function meta() {
  return [{ title: "通知作成 | REC TIME" }];
}

export default function NotificationsNewRoute() {
  return (
    <NotificationCreatePage
      submitter={httpNotificationSubmitter}
      audienceLoader={httpNotificationAudienceLoader}
    />
  );
}

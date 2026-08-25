import { createPageTitle } from "~/config/app";
import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import { httpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";
import { httpNotificationSubmissionApi } from "~/features/notifications/api/http/notification-submission-api";

export function meta() {
  return [{ title: createPageTitle("通知作成") }];
}

export default function NotificationsNewRoute() {
  return (
    <NotificationCreatePage
      api={httpNotificationSubmissionApi}
      audienceApi={httpNotificationAudienceApi}
    />
  );
}

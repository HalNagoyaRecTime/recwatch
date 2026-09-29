import { createPageTitle } from "~/lib/page-title";
import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import { httpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";
import { httpAdminNotificationCommandApi } from "~/features/notifications/api/http/admin-notification-command-api";
import { useFeedback } from "~/features/frame/feedback/hooks/useFeedback";

export function meta() {
  return [{ title: createPageTitle("通知作成") }];
}

export default function NotificationsNewRoute() {
  const { report } = useFeedback();
  return (
    <NotificationCreatePage
      api={httpAdminNotificationCommandApi}
      audienceApi={httpNotificationAudienceApi}
      reportFeedback={report}
    />
  );
}

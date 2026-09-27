import { useParams } from "react-router";

import { httpAdminNotificationCommandApi } from "~/features/notifications/api/http/admin-notification-command-api";
import { httpAdminNotificationQueryApi } from "~/features/notifications/api/http/admin-notification-query-api";
import { httpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";
import { httpNotificationConfigApi } from "~/features/notifications/api/http/notification-config-api";
import { useFeedback } from "~/features/frame/feedback/hooks/useFeedback";
import { NotificationEditPage } from "~/features/notifications/pages/NotificationEditPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("通知編集") }];
}

export default function NotificationEditRoute() {
  const notificationId = Number(useParams().notificationId);
  const { report } = useFeedback();
  return (
    <NotificationEditPage
      audienceApi={httpNotificationAudienceApi}
      commandApi={httpAdminNotificationCommandApi}
      configApi={httpNotificationConfigApi}
      notificationId={notificationId}
      queryApi={httpAdminNotificationQueryApi}
      reportFeedback={report}
    />
  );
}

import { createPageTitle } from "~/lib/page-title";
import { httpAdminNotificationCommandApi } from "~/features/notifications/api/http/admin-notification-command-api";
import { httpAdminNotificationQueryApi } from "~/features/notifications/api/http/admin-notification-query-api";
import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";
import { useFeedback } from "~/features/frame/feedback/hooks/useFeedback";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("通知管理") }];
}

export default function NotificationsRoute() {
  const { report } = useFeedback();
  return (
    <PageLayout>
      <PagePadding>
        <NotificationListPage
          commandApi={httpAdminNotificationCommandApi}
          queryApi={httpAdminNotificationQueryApi}
          reportFeedback={report}
        />
      </PagePadding>
    </PageLayout>
  );
}

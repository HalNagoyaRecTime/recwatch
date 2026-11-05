import { createPageTitle } from "~/lib/page-title";
import { httpAdminNotificationCommandApi } from "~/features/notifications/api/http/admin-notification-command-api";
import { httpAdminNotificationQueryApi } from "~/features/notifications/api/http/admin-notification-query-api";
import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";
import { useFeedback } from "~/features/frame/feedback";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("通知カレンダー") }];
}

export default function NotificationsCalendarRoute() {
  const { report } = useFeedback();
  return (
    <PageLayout>
      <PagePadding>
        <NotificationListPage
          viewMode="calendar"
          commandApi={httpAdminNotificationCommandApi}
          queryApi={httpAdminNotificationQueryApi}
          reportFeedback={report}
        />
      </PagePadding>
    </PageLayout>
  );
}

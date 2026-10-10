import { useFeedback } from "~/features/frame/feedback";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { httpNotificationScheduleQueryApi } from "~/features/notifications/api/http/notification-schedule-query-api";
import { NotificationMonitorPage } from "~/features/notifications/pages/NotificationMonitorPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("配信モニター") }];
}

export default function NotificationMonitorRoute() {
  const { report } = useFeedback();
  return (
    <PageLayout>
      <PagePadding>
        <NotificationMonitorPage
          api={httpNotificationScheduleQueryApi}
          reportFeedback={report}
        />
      </PagePadding>
    </PageLayout>
  );
}

import { Navigate, useSearchParams } from "react-router";
import { createPageTitle } from "~/lib/page-title";
import { httpAdminNotificationCommandApi } from "~/features/notifications/api/http/admin-notification-command-api";
import { httpAdminNotificationQueryApi } from "~/features/notifications/api/http/admin-notification-query-api";
import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";
import { useFeedback } from "~/features/frame/feedback";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("通知管理") }];
}

export default function NotificationsRoute() {
  const { report } = useFeedback();
  const [searchParams] = useSearchParams();
  if (searchParams.get("view") === "calendar") {
    const remainingParams = new URLSearchParams(searchParams);
    remainingParams.delete("view");
    const search = remainingParams.toString();
    return (
      <Navigate
        replace
        to={{
          pathname: "/notifications/calendar",
          search: search ? `?${search}` : "",
        }}
      />
    );
  }
  return (
    <PageLayout>
      <PagePadding>
        <NotificationListPage
          viewMode="list"
          commandApi={httpAdminNotificationCommandApi}
          queryApi={httpAdminNotificationQueryApi}
          reportFeedback={report}
        />
      </PagePadding>
    </PageLayout>
  );
}

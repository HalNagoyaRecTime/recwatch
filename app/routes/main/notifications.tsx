import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "通知管理 | REC TIME" }];
}

export default function NotificationsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <NotificationListPage />
      </PagePadding>
    </PageLayout>
  );
}

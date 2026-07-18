import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import { mockNotificationGroups } from "~/features/notifications/infrastructure/mock-notification-groups";
import { mockNotificationSubmitter } from "~/features/notifications/infrastructure/mock-notification-submitter";

export function meta() {
  return [{ title: "通知作成 | REC TIME" }];
}

export default function NotificationsNewRoute() {
  return (
    <NotificationCreatePage
      submitter={mockNotificationSubmitter}
      groups={mockNotificationGroups}
    />
  );
}

import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import { mockNotificationAudienceOptions } from "~/features/notifications/infrastructure/mock-notification-audience-options";
import { mockNotificationSubmitter } from "~/features/notifications/infrastructure/mock-notification-submitter";

export function meta() {
  return [{ title: "通知作成 | REC TIME" }];
}

export default function NotificationsNewRoute() {
  return (
    <NotificationCreatePage
      submitter={mockNotificationSubmitter}
      audienceOptions={mockNotificationAudienceOptions}
      isSubmissionEnabled={false}
    />
  );
}

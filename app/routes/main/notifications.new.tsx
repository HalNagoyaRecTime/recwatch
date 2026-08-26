import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";

export function meta() {
  return [{ title: "通知作成 | REC TIME" }];
}

export default function NotificationsNewRoute() {
  return <NotificationCreatePage />;
}

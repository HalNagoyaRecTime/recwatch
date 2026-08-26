import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";

export function meta() {
  return [{ title: "通知編集 | REC TIME" }];
}

export default function NotificationsEditRoute() {
  return <NotificationCreatePage mode="edit" />;
}

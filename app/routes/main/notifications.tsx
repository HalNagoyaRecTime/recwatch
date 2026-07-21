import { NotificationsListPage } from "~/features/notifications/pages/NotificationsListPage";

export function meta() {
  return [{ title: "通知管理 | recwatch" }];
}

export default function NotificationsRoute() {
  return <NotificationsListPage />;
}

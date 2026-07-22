import { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";

export function meta() {
  return [{ title: "通知作成 | recwatch" }];
}

export default function NotificationCreateRoute() {
  return <NotificationCreatePage />;
}

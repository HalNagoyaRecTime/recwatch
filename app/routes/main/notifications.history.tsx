import { NotificationHistoryPage } from "~/features/notifications/pages/NotificationHistoryPage";

export function meta() {
  return [{ title: "通知履歴 | recwatch" }];
}

export default function NotificationHistoryRoute() {
  return <NotificationHistoryPage />;
}

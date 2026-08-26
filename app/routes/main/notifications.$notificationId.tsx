import { NotificationDetailPage } from "~/features/notifications/pages/NotificationDetailPage";

export function meta() {
  return [{ title: "通知詳細 | REC TIME" }];
}

export default function NotificationsDetailRoute() {
  return <NotificationDetailPage />;
}

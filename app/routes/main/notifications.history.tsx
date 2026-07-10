import { useLoaderData } from "react-router";

import { notificationsApi } from "~/features/notifications/api";
import { NotificationHistoryPage } from "~/features/notifications/pages/NotificationHistoryPage";

export async function clientLoader() {
  return notificationsApi.listHistory();
}

export function meta() {
  return [{ title: "通知履歴 | recwatch" }];
}

export default function NotificationHistoryRoute() {
  const items = useLoaderData<typeof clientLoader>();

  return <NotificationHistoryPage items={items} />;
}

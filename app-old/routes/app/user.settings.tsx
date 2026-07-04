import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "User Settings | recwatch" }];
}

export default function UserSettingsRoute() {
  return <AdminPlaceholderPage {...pageContent.userSettings} />;
}

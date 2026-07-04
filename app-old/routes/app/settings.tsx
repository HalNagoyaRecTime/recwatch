import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Settings | recwatch" }];
}

export default function SettingsRoute() {
  return <AdminPlaceholderPage {...pageContent.settings} />;
}

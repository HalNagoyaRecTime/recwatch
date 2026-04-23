import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Settings | recwatch" }];
}

export default function SettingsRoute() {
  return <AdminPlaceholderPage {...pageContent.settings} />;
}

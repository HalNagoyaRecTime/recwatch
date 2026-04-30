import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Active Events | recwatch" }];
}

export default function EventsActiveRoute() {
  return <AdminPlaceholderPage {...pageContent.eventsActive} />;
}

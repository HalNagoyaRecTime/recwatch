import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Active Events | recwatch" }];
}

export default function EventsActiveRoute() {
  return <AdminPlaceholderPage {...pageContent.eventsActive} />;
}

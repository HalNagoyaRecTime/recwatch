import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Create Event | recwatch" }];
}

export default function EventsNewRoute() {
  return <AdminPlaceholderPage {...pageContent.eventsNew} />;
}

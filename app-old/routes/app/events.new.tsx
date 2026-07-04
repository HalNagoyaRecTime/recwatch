import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Create Event | recwatch" }];
}

export default function EventsNewRoute() {
  return <AdminPlaceholderPage {...pageContent.eventsNew} />;
}

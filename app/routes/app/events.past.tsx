import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Past Events | recwatch" }];
}

export default function EventsPastRoute() {
  return <AdminPlaceholderPage {...pageContent.eventsPast} />;
}

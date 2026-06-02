import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Past Events | recwatch" }];
}

export default function EventsPastRoute() {
  return <AdminPlaceholderPage {...pageContent.eventsPast} />;
}

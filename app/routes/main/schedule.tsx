import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Schedule | recwatch" }];
}

export default function ScheduleRoute() {
  return <AdminPlaceholderPage {...pageContent.schedule} />;
}

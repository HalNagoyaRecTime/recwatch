import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Schedule | recwatch" }];
}

export default function ScheduleRoute() {
  return <AdminPlaceholderPage {...pageContent.schedule} />;
}

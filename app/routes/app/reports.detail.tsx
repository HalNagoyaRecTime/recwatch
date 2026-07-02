import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Detail | recwatch" }];
}

export default function ReportsDetailRoute() {
  return <AdminPlaceholderPage {...pageContent.reportsDetail} />;
}

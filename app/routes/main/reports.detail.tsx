import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Detail | recwatch" }];
}

export default function ReportsDetailRoute() {
  return <AdminPlaceholderPage {...pageContent.reportsDetail} />;
}

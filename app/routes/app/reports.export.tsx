import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Export | recwatch" }];
}

export default function ReportsExportRoute() {
  return <AdminPlaceholderPage {...pageContent.reportsExport} />;
}

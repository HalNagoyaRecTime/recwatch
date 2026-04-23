import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Export | recwatch" }];
}

export default function ReportsExportRoute() {
  return <AdminPlaceholderPage {...pageContent.reportsExport} />;
}

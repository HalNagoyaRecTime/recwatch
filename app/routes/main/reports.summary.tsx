import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Summary | recwatch" }];
}

export default function ReportsSummaryRoute() {
  return <AdminPlaceholderPage {...pageContent.reportsSummary} />;
}

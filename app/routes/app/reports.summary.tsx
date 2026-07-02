import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Summary | recwatch" }];
}

export default function ReportsSummaryRoute() {
  return <AdminPlaceholderPage {...pageContent.reportsSummary} />;
}

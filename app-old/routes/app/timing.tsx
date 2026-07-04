import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Timing Control | recwatch" }];
}

export default function TimingRoute() {
  return <AdminPlaceholderPage {...pageContent.timing} />;
}

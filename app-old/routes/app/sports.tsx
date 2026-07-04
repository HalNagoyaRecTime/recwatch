import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Sports List | recwatch" }];
}

export default function SportsRoute() {
  return <AdminPlaceholderPage {...pageContent.sports} />;
}

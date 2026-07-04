import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Import | recwatch" }];
}

export default function MembersImportRoute() {
  return <AdminPlaceholderPage {...pageContent.membersImport} />;
}

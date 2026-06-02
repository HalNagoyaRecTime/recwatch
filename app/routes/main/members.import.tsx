import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Import | recwatch" }];
}

export default function MembersImportRoute() {
  return <AdminPlaceholderPage {...pageContent.membersImport} />;
}

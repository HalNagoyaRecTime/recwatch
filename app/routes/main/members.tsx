import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Member List | recwatch" }];
}

export default function MembersRoute() {
  return <AdminPlaceholderPage {...pageContent.members} />;
}

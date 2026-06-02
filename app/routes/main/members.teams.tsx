import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Teams | recwatch" }];
}

export default function MembersTeamsRoute() {
  return <AdminPlaceholderPage {...pageContent.membersTeams} />;
}

import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Teams | recwatch" }];
}

export default function MembersTeamsRoute() {
  return <AdminPlaceholderPage {...pageContent.membersTeams} />;
}

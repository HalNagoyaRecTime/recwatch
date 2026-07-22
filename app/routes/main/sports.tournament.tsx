import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Tournament Setup | recwatch" }];
}

export default function SportsTournamentRoute() {
  return <AdminPlaceholderPage {...pageContent.sportsTournament} />;
}

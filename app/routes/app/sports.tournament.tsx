import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Tournament | recwatch" }];
}

export default function SportsTournamentRoute() {
  return <AdminPlaceholderPage {...pageContent.sportsTournament} />;
}

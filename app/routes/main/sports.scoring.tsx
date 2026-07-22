import { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";
import { pageContent } from "~/features/admin-pages/model/page-content";

export function meta() {
  return [{ title: "Scoring Setup | recwatch" }];
}

export default function SportsScoringRoute() {
  return <AdminPlaceholderPage {...pageContent.sportsScoring} />;
}

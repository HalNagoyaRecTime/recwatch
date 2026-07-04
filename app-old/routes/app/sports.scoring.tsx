import { AdminPlaceholderPage } from "~/features/dashboard/components/AdminPlaceholderPage";
import { pageContent } from "~/features/dashboard/model/page-content";

export function meta() {
  return [{ title: "Scoring Rules | recwatch" }];
}

export default function SportsScoringRoute() {
  return <AdminPlaceholderPage {...pageContent.sportsScoring} />;
}

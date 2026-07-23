import { CompetitionListPage } from "~/features/sports/pages/CompetitionListPage";

export function meta() {
  return [{ title: "競技管理 | recwatch" }];
}

export default function SportsRoute() {
  return <CompetitionListPage />;
}

import { CompetitionEditPage } from "~/features/sports/pages/CompetitionEditPage";

export function meta() {
  return [{ title: "競技 編集 | recwatch" }];
}

export default function CompetitionEditRoute() {
  return <CompetitionEditPage />;
}

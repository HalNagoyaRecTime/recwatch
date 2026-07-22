import { CompetitionCreatePage } from "~/features/sports/pages/CompetitionCreatePage";

export function meta() {
  return [{ title: "競技 新規登録 | recwatch" }];
}

export default function CompetitionCreateRoute() {
  return <CompetitionCreatePage />;
}

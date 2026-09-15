import { createPageTitle } from "~/lib/page-title";
import { CompetitionCreatePage } from "~/features/sports/pages/CompetitionCreatePage";

export function meta() {
  return [{ title: createPageTitle("イベントの新規登録") }];
}

export default function CompetitionCreateRoute() {
  return <CompetitionCreatePage />;
}

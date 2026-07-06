import { CompetitionListPage } from "~/features/sports/pages/CompetitionListPage";
import type { CompetitionData } from "~/features/sports/model/competition";

export function meta() {
  return [{ title: "Sports List | recwatch" }];
}

export default function SportsRoute() {
  //   return <CompetitionListPage competitions={competitions} />; 書き換える

  return <CompetitionListPage competitions={[] as CompetitionData[]} />;
}

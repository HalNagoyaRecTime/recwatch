import { CompetitionListPage } from "~/features/sports/pages/CompetitionListPage";
import type { CompetitionData } from "~/features/sports/model/competition";

export function meta() {
  return [{ title: "イベント一覧 | recwatch" }];
}

export default function SportsRoute() {
  return <CompetitionListPage competitions={competitions} />;
}

const competitions: CompetitionData[] = [
  {
    CompetitionId: 2,
    CompetitionName: "綱引き",
    Venue: "グラウンド A",
    StartTime: "09:45",
  },
  {
    CompetitionId: 3,
    CompetitionName: "玉入れ",
    Venue: "グラウンド B",
    StartTime: "10:30",
  },
  {
    CompetitionId: 5,
    CompetitionName: "借り物競走",
    Venue: "グラウンド A",
    StartTime: "12:15",
  },
  {
    CompetitionId: 6,
    CompetitionName: "リレー",
    Venue: "トラック",
    StartTime: "13:00",
  },
  {
    CompetitionId: 7,
    CompetitionName: "障害物競走",
    Venue: "グラウンド B",
    StartTime: "14:00",
  },
  {
    CompetitionId: 8,
    CompetitionName: "大縄跳び",
    Venue: "グラウンド A",
    StartTime: "14:45",
  },
];

import type { Ranking } from "~/features/ranking/model/ranking";

export const mockRankings: readonly Ranking[] = [
  {
    rank: 1,
    teamId: 1,
    teamName: "青チーム",
    score: 320,
  },
  {
    rank: 2,
    teamId: 2,
    teamName: "赤チーム",
    score: 280,
  },
  {
    rank: 3,
    teamId: 3,
    teamName: "白チーム",
    score: 250,
  },
];

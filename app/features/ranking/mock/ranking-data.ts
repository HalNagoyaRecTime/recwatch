import type { Ranking } from "~/features/ranking/model/ranking";

export const mockRankings: readonly Ranking[] = [
  {
    rank: 1,
    teamName: "青チーム",
    score: 320,
    updatedAt: "2026-09-04T18:30:00+09:00",
  },
  {
    rank: 2,
    teamName: "赤チーム",
    score: 280,
    updatedAt: "2026-09-04T18:32:00+09:00",
  },
  {
    rank: 3,
    teamName: "白チーム",
    score: 250,
    updatedAt: "2026-09-04T17:55:00+09:00",
  },
];

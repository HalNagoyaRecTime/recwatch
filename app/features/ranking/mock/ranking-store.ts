import { mockRankings } from "~/features/ranking/mock/ranking-data";
import type { Ranking } from "~/features/ranking/model/ranking";

export type RankingInput = {
  points: number;
};

let rankings = mockRankings.map((ranking) => ({ ...ranking }));

export function getRanking(teamId: number): Ranking | null {
  const ranking = rankings.find((item) => item.teamId === teamId);
  return ranking ? { ...ranking } : null;
}

export function getRankings(): Ranking[] {
  return rankings.map((ranking) => ({ ...ranking }));
}

export function updateRanking(
  teamId: number,
  input: RankingInput
): Ranking | null {
  const ranking = rankings.find((item) => item.teamId === teamId);
  if (!ranking) return null;

  const updatedRanking = {
    ...ranking,
    score: ranking.score + input.points,
    updatedAt: "2026-09-05T12:00:00+09:00",
  };
  rankings = rankings.map((item) =>
    item.teamId === teamId ? updatedRanking : item
  );
  return { ...updatedRanking };
}

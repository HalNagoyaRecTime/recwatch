import { mockRankings } from "~/features/ranking/mock/ranking-data";
import type { Ranking } from "~/features/ranking/model/ranking";

export type RankingInput = {
  score: number;
};

let rankings = mockRankings.map((ranking) => ({ ...ranking }));

export function getRanking(rank: number): Ranking | null {
  const ranking = rankings.find((item) => item.rank === rank);
  return ranking ? { ...ranking } : null;
}

export function getRankings(): Ranking[] {
  return rankings.map((ranking) => ({ ...ranking }));
}

export function updateRanking(
  currentRank: number,
  input: RankingInput
): Ranking | null {
  const ranking = rankings.find((item) => item.rank === currentRank);
  if (!ranking) return null;

  const updatedRanking = {
    ...ranking,
    score: input.score,
    updatedAt: "2026-09-05T12:00:00+09:00",
  };
  rankings = rankings.map((item) =>
    item.rank === currentRank ? updatedRanking : item
  );
  return { ...updatedRanking };
}

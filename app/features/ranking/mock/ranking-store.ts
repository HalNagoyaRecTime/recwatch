import { mockRankings } from "~/features/ranking/mock/ranking-data";
import type { Ranking } from "~/features/ranking/model/ranking";

export type RankingInput = {
  points: number;
};

// 得点降順に並べ直し、同点は同順位として次の順位を人数分繰り下げる。
// rectime-apiのGET /rankingが行うRANK() OVER (ORDER BY scores DESC)と
// 同じ考え方。得点が変わるたびにここを通すことで、rankと表示順を
// 常に最新の状態に保つ。
function recomputeRanks(items: Ranking[]): Ranking[] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  let previousScore: number | null = null;
  let previousRank = 0;
  return sorted.map((item, index) => {
    const rank = item.score === previousScore ? previousRank : index + 1;
    previousScore = item.score;
    previousRank = rank;
    return { ...item, rank };
  });
}

let rankings = recomputeRanks(mockRankings.map((ranking) => ({ ...ranking })));

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
  const exists = rankings.some((item) => item.teamId === teamId);
  if (!exists) return null;

  const updated = rankings.map((item) =>
    item.teamId === teamId
      ? { ...item, score: item.score + input.points }
      : item
  );
  rankings = recomputeRanks(updated);
  return rankings.find((item) => item.teamId === teamId) ?? null;
}

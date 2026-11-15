import { describe, expect, it, vi } from "vitest";

import { findRankingPage } from "~/features/ranking/application/find-ranking-page";
import type { RankingListQuery } from "~/features/ranking/api";
import type { Ranking } from "~/features/ranking/model/ranking";

function createFetcher(total: number) {
  const all: Ranking[] = Array.from({ length: total }, (_, index) => ({
    rank: index + 1,
    teamId: 1000 + index,
    teamName: `チーム${index}`,
    score: total - index,
  }));
  return vi.fn(async ({ limit, offset }: RankingListQuery) => ({
    items: all.slice(offset, offset + limit),
    limit,
    offset,
    total,
  }));
}

describe("findRankingPage", () => {
  it("一覧での位置から、表示件数ごとのページ番号を返す", async () => {
    const fetchPage = createFetcher(13);

    expect(await findRankingPage(1000, 10, fetchPage)).toBe(1);
    expect(await findRankingPage(1009, 10, fetchPage)).toBe(1);
    expect(await findRankingPage(1010, 10, fetchPage)).toBe(2);
  });

  it("1回で取りきれない場合は続きを取得して探す", async () => {
    const fetchPage = createFetcher(250);

    expect(await findRankingPage(1000 + 234, 10, fetchPage)).toBe(24);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("見つからなければ null を返す", async () => {
    const fetchPage = createFetcher(13);

    expect(await findRankingPage(1, 10, fetchPage)).toBeNull();
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});

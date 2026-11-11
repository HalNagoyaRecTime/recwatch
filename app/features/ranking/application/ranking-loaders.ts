import { RankingApi, type RankingListQuery } from "~/features/ranking/api";

export async function loadRankingListPage(query: RankingListQuery) {
  const page = await RankingApi.getRankingList(query);
  return {
    limit: page.limit,
    offset: page.offset,
    rankings: page.items,
    total: page.total,
  };
}

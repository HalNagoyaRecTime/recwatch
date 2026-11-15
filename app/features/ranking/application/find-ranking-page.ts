import {
  RankingApi,
  type RankingListPage,
  type RankingListQuery,
} from "~/features/ranking/api";
import { loadAllPages } from "~/lib/load-all-pages";
import type { Ranking } from "~/features/ranking/model/ranking";

/**
 * 検索なしのランキング一覧で、指定したチームが何ページ目に載っているかを返す。
 * 並び順（得点の高い順、同点はチームID順）はAPIが決めるため、画面側で
 * 計算せず、APIの一覧を先頭から順にたどって位置を求める。チームが
 * 見つかった時点で取得を止める。
 * 見つからない場合（削除済みなど）は null を返す。
 */
export async function findRankingPage(
  teamId: number,
  pageSize: number,
  fetchPage: (
    query: RankingListQuery
  ) => Promise<RankingListPage> = RankingApi.getRankingList
): Promise<number | null> {
  const isTarget = (ranking: Ranking) => ranking.teamId === teamId;
  const rankings = await loadAllPages(
    async (offset, limit) => (await fetchPage({ limit, offset })).items,
    { stopWhen: (page) => page.some(isTarget) }
  );
  const index = rankings.findIndex(isTarget);
  return index >= 0 ? Math.floor(index / pageSize) + 1 : null;
}

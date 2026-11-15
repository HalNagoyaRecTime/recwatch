import {
  RankingApi,
  type RankingListPage,
  type RankingListQuery,
} from "~/features/ranking/api";

// ランキング取得APIが一度に返せる最大件数
const FETCH_BATCH_SIZE = 100;

/**
 * 検索なしのランキング一覧で、指定したチームが何ページ目に載っているかを返す。
 * 並び順（得点の高い順、同点はチームID順）はAPIが決めるため、画面側で
 * 計算せず、APIの一覧を先頭から順にたどって位置を求める。
 * 見つからない場合（削除済みなど）は null を返す。
 */
export async function findRankingPage(
  teamId: number,
  pageSize: number,
  fetchPage: (
    query: RankingListQuery
  ) => Promise<RankingListPage> = RankingApi.getRankingList
): Promise<number | null> {
  for (let offset = 0; ; offset += FETCH_BATCH_SIZE) {
    const page = await fetchPage({ limit: FETCH_BATCH_SIZE, offset });
    const index = page.items.findIndex((ranking) => ranking.teamId === teamId);
    if (index >= 0) return Math.floor((offset + index) / pageSize) + 1;
    if (page.items.length === 0 || offset + page.items.length >= page.total) {
      return null;
    }
  }
}

import { rankingHttpApi } from "./http/ranking-http";
import { toRanking } from "./mappers/ranking-mappers";
import type { RankingListQuery } from "./contracts/ranking-api";
import type { Ranking } from "../model/ranking";

export type RankingListPage = {
  items: Ranking[];
  total: number;
  limit: number;
  offset: number;
};

export const RankingApi = {
  async getRankingList(query: RankingListQuery): Promise<RankingListPage> {
    const result = await rankingHttpApi.getRankingList(query);
    return {
      items: result.items.map(toRanking),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  },
};

export type { RankingEntryDTO, RankingListPageDTO } from "./dto/ranking-dto";
export type { RankingListQuery } from "./contracts/ranking-api";

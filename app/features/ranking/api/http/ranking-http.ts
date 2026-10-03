import { apiClient } from "~/lib/api-client";
import type { RankingListQuery } from "../contracts/ranking-api";
import type { RankingListPageDTO } from "../dto/ranking-dto";

export const rankingHttpApi = {
  getRankingList: (query: RankingListQuery) => {
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.search) params.set("search", query.search);
    return apiClient.get<RankingListPageDTO>(
      `/api/v1/ranking?${params.toString()}`
    );
  },
};

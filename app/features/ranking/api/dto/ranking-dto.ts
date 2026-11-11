export type RankingEntryDTO = {
  rank: number;
  team_id: number;
  team_name: string;
  scores: number;
};

export type RankingListPageDTO = {
  items: RankingEntryDTO[];
  total: number;
  limit: number;
  offset: number;
};

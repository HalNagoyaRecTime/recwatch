export type TeamDTO = {
  team_id: number;
  team_name: string;
  registered_classes: string[];
  scores: number;
  created_at: string;
  updated_at: string;
};

export type TeamListPageDTO = {
  items: TeamDTO[];
  total: number;
  limit: number;
  offset: number;
};

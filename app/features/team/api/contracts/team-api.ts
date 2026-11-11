export type TeamWriteRequest = {
  teamName: string;
  classCodes: string[];
};

export type TeamListSortBy = "teamName" | "registeredAt" | "updatedAt";
export type TeamListSortOrder = "asc" | "desc";

export type TeamListQuery = {
  limit: number;
  offset: number;
  search?: string;
  sortBy?: TeamListSortBy;
  sortOrder?: TeamListSortOrder;
};

export type TeamScoreAddRequest = {
  points: number;
};

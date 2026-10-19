export type RankingNavigationTarget = {
  pathname: string;
  search: string;
};

export function rankingEditTarget(
  teamId: number,
  search: string
): RankingNavigationTarget {
  return {
    pathname: `/ranking/${teamId}/edit`,
    search: normalizeSearch(search),
  };
}

function normalizeSearch(search: string) {
  if (!search) return "";
  return search.startsWith("?") ? search : `?${search}`;
}

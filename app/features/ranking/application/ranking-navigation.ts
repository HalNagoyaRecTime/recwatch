export type RankingNavigationTarget = {
  pathname: string;
  search: string;
};

export function rankingListTarget(search: string): RankingNavigationTarget {
  return { pathname: "/ranking", search: normalizeSearch(search) };
}

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

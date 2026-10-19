export type TeamNavigationTarget = {
  pathname: string;
  search: string;
};

export function teamCreateTarget(search: string): TeamNavigationTarget {
  return { pathname: "/teams/new", search: normalizeSearch(search) };
}

export function teamDetailTarget(
  teamId: number,
  search: string
): TeamNavigationTarget {
  return { pathname: `/teams/${teamId}`, search: normalizeSearch(search) };
}

export function teamEditTarget(
  teamId: number,
  search: string
): TeamNavigationTarget {
  return {
    pathname: `/teams/${teamId}/edit`,
    search: normalizeSearch(search),
  };
}

function normalizeSearch(search: string) {
  if (!search) return "";
  return search.startsWith("?") ? search : `?${search}`;
}

export type RankingListUrlState = {
  search: string;
  page: number;
};

export function parseRankingListUrl(
  input: string | URLSearchParams
): RankingListUrlState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const page = Number(params.get("page"));

  return {
    search: params.get("search")?.trim() ?? "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function updateRankingListUrl(
  input: string | URLSearchParams,
  updates: Partial<RankingListUrlState>
) {
  const params =
    typeof input === "string"
      ? new URLSearchParams(input)
      : new URLSearchParams(input);

  if (updates.search !== undefined) {
    setOrDelete(params, "search", updates.search.trim());
  }
  if (updates.page !== undefined) {
    if (updates.page <= 1) params.delete("page");
    else params.set("page", String(updates.page));
  }

  return params.toString();
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

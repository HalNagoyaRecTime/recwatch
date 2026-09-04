import type { DataTableSortDirection } from "~/components/ui/data-table/data-table-types";

export type TeamListSortBy = "id" | "name" | "updatedAt";

export type TeamListUrlState = {
  search: string;
  page: number;
  sortBy: TeamListSortBy | null;
  sortOrder: DataTableSortDirection | null;
};

export function parseTeamListUrl(
  input: string | URLSearchParams
): TeamListUrlState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const page = Number(params.get("page"));
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");

  return {
    search: params.get("search")?.trim() ?? "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    sortBy: isSortBy(sortBy) ? sortBy : null,
    sortOrder: isSortOrder(sortOrder) ? sortOrder : null,
  };
}

export function updateTeamListUrl(
  input: string | URLSearchParams,
  updates: Partial<TeamListUrlState>
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
  if (updates.sortBy !== undefined) {
    setOrDelete(params, "sortBy", updates.sortBy ?? "");
  }
  if (updates.sortOrder !== undefined) {
    setOrDelete(params, "sortOrder", updates.sortOrder ?? "");
  }

  return params.toString();
}

function isSortBy(value: string | null): value is TeamListSortBy {
  return value === "id" || value === "name" || value === "updatedAt";
}

function isSortOrder(value: string | null): value is DataTableSortDirection {
  return value === "asc" || value === "desc";
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

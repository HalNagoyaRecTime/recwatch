export type TeacherListSortBy =
  | "teacherId"
  | "displayName"
  | "classCode"
  | "className";
export type TeacherListSortOrder = "asc" | "desc";
export type TeacherBooleanFilter = "true" | "false" | "all";

export type TeacherListUrlState = {
  search: string;
  page: number;
  sortBy: TeacherListSortBy | null;
  sortOrder: TeacherListSortOrder | null;
  isStaff: TeacherBooleanFilter;
  isLiveActive: TeacherBooleanFilter;
};

const DEFAULT_PAGE = 1;

export function parseTeacherListUrl(
  input: string | URLSearchParams
): TeacherListUrlState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const page = Number(params.get("page"));
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");

  return {
    search: params.get("search")?.trim() ?? "",
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    sortBy: isTeacherListSortBy(sortBy) ? sortBy : null,
    sortOrder: isTeacherListSortOrder(sortOrder) ? sortOrder : null,
    isStaff: isTeacherBooleanFilter(params.get("isStaff"))
      ? (params.get("isStaff") as TeacherBooleanFilter)
      : "all",
    isLiveActive: isTeacherBooleanFilter(params.get("isLiveActive"))
      ? (params.get("isLiveActive") as TeacherBooleanFilter)
      : "all",
  };
}

export function updateTeacherListUrl(
  input: string | URLSearchParams,
  updates: Partial<TeacherListUrlState>
): string {
  const params =
    typeof input === "string"
      ? new URLSearchParams(input)
      : new URLSearchParams(input);

  if (updates.search !== undefined) {
    setOrDelete(params, "search", updates.search.trim());
  }
  if (updates.page !== undefined) {
    if (updates.page <= DEFAULT_PAGE) params.delete("page");
    else params.set("page", String(updates.page));
  }
  if (updates.sortBy !== undefined) {
    setOrDelete(params, "sortBy", updates.sortBy ?? "");
  }
  if (updates.sortOrder !== undefined) {
    setOrDelete(params, "sortOrder", updates.sortOrder ?? "");
  }
  if (updates.isStaff !== undefined) {
    setFilterOrDelete(params, "isStaff", updates.isStaff);
  }
  if (updates.isLiveActive !== undefined) {
    setFilterOrDelete(params, "isLiveActive", updates.isLiveActive);
  }

  return params.toString();
}

function isTeacherListSortBy(value: string | null): value is TeacherListSortBy {
  return (
    value === "teacherId" ||
    value === "displayName" ||
    value === "classCode" ||
    value === "className"
  );
}

function isTeacherBooleanFilter(
  value: string | null
): value is TeacherBooleanFilter {
  return value === "true" || value === "false" || value === "all";
}

function isTeacherListSortOrder(
  value: string | null
): value is TeacherListSortOrder {
  return value === "asc" || value === "desc";
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function setFilterOrDelete(
  params: URLSearchParams,
  key: string,
  value: TeacherBooleanFilter
) {
  if (value === "all") params.delete(key);
  else params.set(key, value);
}

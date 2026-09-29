import type {
  ClassRoomListSortBy,
  ClassRoomListSortOrder,
} from "~/features/classRoom/api/contracts/class-room-api";

export type ClassRoomListUrlState = {
  search: string;
  page: number;
  sortBy: ClassRoomListSortBy | null;
  sortOrder: ClassRoomListSortOrder | null;
};

const DEFAULT_PAGE = 1;

export function parseClassRoomListUrl(
  input: string | URLSearchParams
): ClassRoomListUrlState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const page = Number(params.get("page"));
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");

  return {
    search: params.get("search")?.trim() ?? "",
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    sortBy: isClassRoomListSortBy(sortBy) ? sortBy : null,
    sortOrder: isClassRoomListSortOrder(sortOrder) ? sortOrder : null,
  };
}

export function updateClassRoomListUrl(
  input: string | URLSearchParams,
  updates: Partial<ClassRoomListUrlState>
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

  return params.toString();
}

function isClassRoomListSortBy(
  value: string | null
): value is ClassRoomListSortBy {
  return (
    value === "classRoomId" ||
    value === "classCode" ||
    value === "className" ||
    value === "teacherName" ||
    value === "studentCount"
  );
}

function isClassRoomListSortOrder(
  value: string | null
): value is ClassRoomListSortOrder {
  return value === "asc" || value === "desc";
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

import type {
  StudentBooleanFilter,
  StudentListSortBy,
  StudentListSortOrder,
} from "~/features/members/api";

export type StudentListUrlState = {
  search: string;
  page: number;
  classRoomId: number | null;
  sortBy: StudentListSortBy | null;
  sortOrder: StudentListSortOrder | null;
  isStaff: StudentBooleanFilter;
  isLiveActive: StudentBooleanFilter;
};

const DEFAULT_PAGE = 1;

export function parseStudentListUrl(
  input: string | URLSearchParams
): StudentListUrlState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const page = Number(params.get("page"));
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");
  const classRoomId = Number(params.get("classRoomId"));

  return {
    search: params.get("search")?.trim() ?? "",
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    classRoomId:
      Number.isInteger(classRoomId) && classRoomId > 0 ? classRoomId : null,
    sortBy: isStudentListSortBy(sortBy) ? sortBy : null,
    sortOrder: isStudentListSortOrder(sortOrder) ? sortOrder : null,
    isStaff: isBooleanFilter(params.get("isStaff"))
      ? (params.get("isStaff") as StudentBooleanFilter)
      : "all",
    isLiveActive: isBooleanFilter(params.get("isLiveActive"))
      ? (params.get("isLiveActive") as StudentBooleanFilter)
      : "all",
  };
}

export function updateStudentListUrl(
  input: string | URLSearchParams,
  updates: Partial<StudentListUrlState>
): string {
  const params = new URLSearchParams(input);

  if (updates.search !== undefined)
    setOrDelete(params, "search", updates.search.trim());
  if (updates.page !== undefined) {
    if (updates.page <= DEFAULT_PAGE) params.delete("page");
    else params.set("page", String(updates.page));
  }
  if (updates.classRoomId !== undefined) {
    if (updates.classRoomId && updates.classRoomId > 0) {
      params.set("classRoomId", String(updates.classRoomId));
    } else {
      params.delete("classRoomId");
    }
  }
  if (updates.sortBy !== undefined)
    setOrDelete(params, "sortBy", updates.sortBy ?? "");
  if (updates.sortOrder !== undefined) {
    setOrDelete(params, "sortOrder", updates.sortOrder ?? "");
  }
  if (updates.isStaff !== undefined)
    setFilterOrDelete(params, "isStaff", updates.isStaff);
  if (updates.isLiveActive !== undefined) {
    setFilterOrDelete(params, "isLiveActive", updates.isLiveActive);
  }

  return params.toString();
}

function isStudentListSortBy(value: string | null): value is StudentListSortBy {
  return (
    value === "studentId" ||
    value === "studentIdNumber" ||
    value === "displayName" ||
    value === "classCode" ||
    value === "className" ||
    value === "attendanceNumber" ||
    value === "isStaff" ||
    value === "isLiveActive"
  );
}

function isStudentListSortOrder(
  value: string | null
): value is StudentListSortOrder {
  return value === "asc" || value === "desc";
}

function isBooleanFilter(value: string | null): value is StudentBooleanFilter {
  return value === "true" || value === "false" || value === "all";
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function setFilterOrDelete(
  params: URLSearchParams,
  key: string,
  value: StudentBooleanFilter
) {
  if (value === "all") params.delete(key);
  else params.set(key, value);
}

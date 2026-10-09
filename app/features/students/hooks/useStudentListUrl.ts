import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { useDebouncedUrlSearch } from "~/hooks/useDebouncedUrlSearch";
import type {
  StudentBooleanFilter,
  StudentListSortBy,
} from "~/features/students/api/contracts/student-api";
import {
  parseStudentListUrl,
  updateStudentListUrl,
} from "~/features/students/application/student-list-url";

export function useStudentListUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseStudentListUrl(searchParams);
  const updateSearch = useCallback(
    (currentSearchParams: URLSearchParams, value: string) =>
      updateStudentListUrl(currentSearchParams, {
        page: 1,
        search: value,
      }),
    []
  );
  const { searchInput, setSearchInput } = useDebouncedUrlSearch({
    search: state.search,
    setSearchParams,
    updateSearch,
  });

  const updateSearchParams = useCallback(
    (updates: Parameters<typeof updateStudentListUrl>[1], replace = false) => {
      setSearchParams(
        (currentSearchParams) =>
          updateStudentListUrl(currentSearchParams, updates),
        { replace }
      );
    },
    [setSearchParams]
  );

  function handleSortChange(columnId: string) {
    const sortColumns: Record<string, StudentListSortBy> = {
      "student-id": "studentId",
      "student-number": "studentIdNumber",
      "display-name": "displayName",
      staff: "isStaff",
      active: "isLiveActive",
      "class-code": "classCode",
      "class-name": "className",
      "attendance-number": "attendanceNumber",
    };
    const nextSortBy = sortColumns[columnId];
    if (!nextSortBy) return;

    setSearchParams((currentSearchParams) => {
      const currentState = parseStudentListUrl(currentSearchParams);
      const nextSortOrder =
        currentState.sortBy === nextSortBy && currentState.sortOrder === "asc"
          ? "desc"
          : "asc";
      return updateStudentListUrl(currentSearchParams, {
        page: 1,
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
      });
    });
  }

  function handleFilterChange(
    key: "isStaff" | "isLiveActive",
    value: StudentBooleanFilter
  ) {
    updateSearchParams({ page: 1, [key]: value });
  }

  return {
    ...state,
    handleFilterChange,
    handleSortChange,
    searchInput,
    setSearchInput,
    updateSearchParams,
  };
}

import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { useDebouncedUrlSearch } from "~/hooks/useDebouncedUrlSearch";
import type {
  TeacherBooleanFilter,
  TeacherListSortBy,
} from "~/features/teachers/api/contracts/teacher-api";
import {
  parseTeacherListUrl,
  updateTeacherListUrl,
} from "~/features/teachers/application/teacher-list-url";

export function useTeacherListUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseTeacherListUrl(searchParams);
  const updateSearch = useCallback(
    (currentSearchParams: URLSearchParams, value: string) =>
      updateTeacherListUrl(currentSearchParams, {
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
    (updates: Parameters<typeof updateTeacherListUrl>[1], replace = false) => {
      setSearchParams(
        (currentSearchParams) =>
          updateTeacherListUrl(currentSearchParams, updates),
        { replace }
      );
    },
    [setSearchParams]
  );

  function handleSortChange(columnId: string) {
    const sortColumns: Record<string, TeacherListSortBy> = {
      "teacher-id": "teacherId",
      "display-name": "displayName",
      staff: "isStaff",
      active: "isLiveActive",
      "class-code": "classCode",
      "class-name": "className",
    };
    const nextSortBy = sortColumns[columnId];
    if (!nextSortBy) return;

    setSearchParams((currentSearchParams) => {
      const currentState = parseTeacherListUrl(currentSearchParams);
      const nextSortOrder =
        currentState.sortBy === nextSortBy && currentState.sortOrder === "asc"
          ? "desc"
          : "asc";
      return updateTeacherListUrl(currentSearchParams, {
        page: 1,
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
      });
    });
  }

  function handleFilterChange(
    key: "isStaff" | "isLiveActive",
    value: TeacherBooleanFilter
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

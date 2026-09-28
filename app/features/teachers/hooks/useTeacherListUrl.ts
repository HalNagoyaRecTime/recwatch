import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

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
  const [searchDraft, setSearchDraft] = useState<{
    search: string;
    value: string;
  } | null>(null);
  const searchInput =
    searchDraft?.search === state.search ? searchDraft.value : state.search;
  const previousSearch = useRef(state.search);

  useEffect(() => {
    if (previousSearch.current === state.search) return;
    previousSearch.current = state.search;
    const timer = window.setTimeout(() => setSearchDraft(null), 0);
    return () => window.clearTimeout(timer);
  }, [state.search]);

  useEffect(() => {
    if (searchInput.trim() === state.search) return;
    const timer = window.setTimeout(() => {
      setSearchParams((currentSearchParams) =>
        updateTeacherListUrl(currentSearchParams, {
          page: 1,
          search: searchInput,
        })
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams, state.search]);

  function setSearchInput(value: string) {
    setSearchDraft({ search: state.search, value });
  }

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

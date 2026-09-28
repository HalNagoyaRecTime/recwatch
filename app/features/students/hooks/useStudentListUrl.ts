import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

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
        updateStudentListUrl(currentSearchParams, {
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

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import type { ClassRoomListSortBy } from "~/features/classRoom/api/contracts/class-room-api";
import {
  parseClassRoomListUrl,
  updateClassRoomListUrl,
} from "~/features/classRoom/application/class-room-list-url";

export function useClassRoomListUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseClassRoomListUrl(searchParams);
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
        updateClassRoomListUrl(currentSearchParams, {
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
    (
      updates: Parameters<typeof updateClassRoomListUrl>[1],
      replace = false
    ) => {
      setSearchParams(
        (currentSearchParams) =>
          updateClassRoomListUrl(currentSearchParams, updates),
        { replace }
      );
    },
    [setSearchParams]
  );

  function handleSortChange(columnId: string) {
    const sortColumns: Record<string, ClassRoomListSortBy> = {
      "class-room-id": "classRoomId",
      "class-room-code": "classCode",
      "class-room-name": "className",
      "student-count": "studentCount",
      "teacher-name": "teacherName",
    };
    const nextSortBy = sortColumns[columnId];
    if (!nextSortBy) return;

    setSearchParams((currentSearchParams) => {
      const currentState = parseClassRoomListUrl(currentSearchParams);
      const nextSortOrder =
        currentState.sortBy === nextSortBy && currentState.sortOrder === "asc"
          ? "desc"
          : "asc";
      return updateClassRoomListUrl(currentSearchParams, {
        page: 1,
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
      });
    });
  }

  return {
    ...state,
    handleSortChange,
    searchInput,
    setSearchInput,
    updateSearchParams,
  };
}

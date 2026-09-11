import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import type { ClassRoomListSortBy } from "~/features/classRoom/api/contracts/class-room-api";
import {
  parseClassRoomListUrl,
  updateClassRoomListUrl,
} from "~/features/classRoom/application/class-room-list-url";

export function useClassRoomListUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseClassRoomListUrl(searchParams);
  const [searchInput, setSearchInput] = useState(state.search);

  useEffect(() => {
    if (searchInput.trim() === state.search) return;
    const timer = window.setTimeout(() => {
      setSearchParams(
        updateClassRoomListUrl(searchParams, {
          page: 1,
          search: searchInput,
        })
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams, state.search]);

  const updateSearchParams = useCallback(
    (
      updates: Parameters<typeof updateClassRoomListUrl>[1],
      replace = false
    ) => {
      setSearchParams(updateClassRoomListUrl(searchParams, updates), {
        replace,
      });
    },
    [searchParams, setSearchParams]
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
    searchParams,
    setSearchInput,
    setSearchParams,
    updateSearchParams,
  };
}

import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { useDebouncedUrlSearch } from "~/hooks/useDebouncedUrlSearch";
import type { ClassRoomListSortBy } from "~/features/classRoom/api/contracts/class-room-api";
import {
  parseClassRoomListUrl,
  updateClassRoomListUrl,
} from "~/features/classRoom/application/class-room-list-url";

export function useClassRoomListUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseClassRoomListUrl(searchParams);
  const updateSearch = useCallback(
    (currentSearchParams: URLSearchParams, value: string) =>
      updateClassRoomListUrl(currentSearchParams, {
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

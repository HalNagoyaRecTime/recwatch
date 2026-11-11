import { useCallback } from "react";
import { useSearchParams } from "react-router";

import {
  parseClassRoomMembershipUrl,
  updateClassRoomMembershipUrl,
} from "~/features/students/application/class-room-membership-url";
import { useDebouncedUrlSearch } from "~/hooks/useDebouncedUrlSearch";

export function useClassRoomMembershipUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseClassRoomMembershipUrl(searchParams);
  const updateSearch = useCallback(
    (current: URLSearchParams, value: string) =>
      updateClassRoomMembershipUrl(current, {
        studentSearch: value,
        studentSearchPage: 1,
      }),
    []
  );
  const { searchInput, setSearchInput } = useDebouncedUrlSearch({
    replace: true,
    search: state.studentSearch,
    setSearchParams,
    updateSearch,
  });

  const updateSearchParams = useCallback(
    (updates: Parameters<typeof updateClassRoomMembershipUrl>[1]) => {
      setSearchParams(
        (current) => updateClassRoomMembershipUrl(current, updates),
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return {
    ...state,
    changeMemberPage: (page: number) =>
      updateSearchParams({ memberPage: page }),
    changeStudentSearchPage: (page: number) =>
      updateSearchParams({ studentSearchPage: page }),
    searchInput,
    setSearchInput,
  };
}

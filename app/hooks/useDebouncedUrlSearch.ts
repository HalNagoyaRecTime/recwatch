import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

type SetSearchParams = ReturnType<typeof useSearchParams>[1];

export type DebouncedUrlSearchOptions = {
  search: string;
  setSearchParams: SetSearchParams;
  updateSearch: (current: URLSearchParams, value: string) => string;
  delay?: number;
  replace?: boolean;
};

/**
 * Keeps an editable search draft separate from the URL and commits it with a
 * functional URLSearchParams update so pending input cannot overwrite a sort
 * or filter navigation that happens before the debounce expires.
 */
export function useDebouncedUrlSearch({
  search,
  setSearchParams,
  updateSearch,
  delay = 250,
  replace = false,
}: DebouncedUrlSearchOptions) {
  const [draft, setDraft] = useState<{
    sourceSearch: string;
    value: string;
  } | null>(null);
  const previousSearch = useRef(search);
  const searchInput = draft?.sourceSearch === search ? draft.value : search;

  useEffect(() => {
    if (previousSearch.current === search) return;
    previousSearch.current = search;

    const resetTimer = window.setTimeout(() => setDraft(null), 0);
    return () => window.clearTimeout(resetTimer);
  }, [search]);

  useEffect(() => {
    if (searchInput.trim() === search) return;

    const timer = window.setTimeout(() => {
      setSearchParams(
        (currentSearchParams) => updateSearch(currentSearchParams, searchInput),
        { replace }
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, replace, search, searchInput, setSearchParams, updateSearch]);

  const setSearchInput = useCallback(
    (value: string) => {
      setDraft({ sourceSearch: search, value });
    },
    [search]
  );

  return { searchInput, setSearchInput };
}

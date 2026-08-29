import { createPortal } from "react-dom";
import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";

import { SearchAnchor } from "~/features/frame/main-header/search/components/SearchAnchor";
import { SearchBackdrop } from "~/features/frame/main-header/search/components/SearchBackdrop";
import { SearchBarContent } from "~/features/frame/main-header/search/components/SearchBarContent";
import { SearchExpandedBody } from "~/features/frame/main-header/search/components/SearchExpandedBody";
import { SearchPositionContainer } from "~/features/frame/main-header/search/components/SearchPositionContainer";
import { SearchResultsPanel } from "~/features/frame/main-header/search/components/SearchResultsPanel";
import { SearchShell } from "~/features/frame/main-header/search/components/SearchShell";
import { useSearchTransition } from "~/features/frame/main-header/search/hooks/useSearchTransition";
import { SearchFooter } from "~/features/frame/main-header/search/components/SearchFooter";
import { filterNavigationSearchResults } from "~/features/frame/main-header/search/constants/navigationSearchResults";
import { useSearchResultNavigation } from "~/features/frame/main-header/search/hooks/useSearchResultNavigation";

export function SearchBtn() {
  const navigate = useNavigate();
  const { anchorRef, close, frame, inputRef, isOpen, open, query, setQuery } =
    useSearchTransition();
  const shellRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => filterNavigationSearchResults(query), [query]);

  const handleConfirmIndex = useCallback(
    (index: number) => {
      const selectedResult = results[index];

      if (!selectedResult) {
        return;
      }

      close();
      void navigate(selectedResult.to);
    },
    [close, navigate, results]
  );

  const { resetSelection, selectedIndex, setSelectedIndex } =
    useSearchResultNavigation({
      isOpen,
      resultCount: results.length,
      onConfirmIndex: handleConfirmIndex,
      scopeRef: shellRef,
    });

  const handleOpen = useCallback(() => {
    resetSelection();
    open();
  }, [open, resetSelection]);

  const handleClose = useCallback(() => {
    resetSelection();
    close();
  }, [close, resetSelection]);

  const handleQueryChange = useCallback(
    (value: string) => {
      resetSelection();
      setQuery(value);
    },
    [resetSelection, setQuery]
  );

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <>
      {/* domの場所確保用 */}
      <SearchAnchor anchorRef={anchorRef} />

      {isMounted
        ? createPortal(
            <>
              {/* 黒背景 */}
              <SearchBackdrop isActive={isOpen} onClose={handleClose} />
              <SearchPositionContainer
                height={frame.height}
                right={frame.right}
                top={frame.top}
                width={frame.width}
                transform={frame.transform}
              >
                <SearchShell rootRef={shellRef} isOpen={isOpen}>
                  <SearchBarContent
                    inputRef={inputRef}
                    isOpen={isOpen}
                    query={query}
                    onChange={handleQueryChange}
                    onOpen={handleOpen}
                  />
                  <SearchExpandedBody isOpen={isOpen}>
                    <SearchResultsPanel
                      results={results}
                      selectedIndex={selectedIndex}
                      onSelectIndex={setSelectedIndex}
                      onConfirmIndex={handleConfirmIndex}
                    />
                    <SearchFooter />
                  </SearchExpandedBody>
                </SearchShell>
              </SearchPositionContainer>
            </>,
            document.body
          )
        : null}
    </>
  );
}

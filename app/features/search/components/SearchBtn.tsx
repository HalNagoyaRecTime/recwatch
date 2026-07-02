import { createPortal } from "react-dom";
import { useCallback, useRef, useSyncExternalStore } from "react";

import { SearchAnchor } from "~/features/search/components/SearchAnchor";
import { SearchBackdrop } from "~/features/search/components/SearchBackdrop";
import { SearchBarContent } from "~/features/search/components/SearchBarContent";
import { SearchExpandedBody } from "~/features/search/components/SearchExpandedBody";
import { SearchPositionContainer } from "~/features/search/components/SearchPositionContainer";
import { SearchResultsPanel } from "~/features/search/components/SearchResultsPanel";
import { SearchShell } from "~/features/search/components/SearchShell";
import { useSearchTransition } from "~/features/search/hooks/useSearchTransition";
import { SearchFooter } from "~/features/search/components/SearchFooter";
import { MOCK_SEARCH_RESULTS } from "~/features/search/constants/mockSearchResults";
import { useSearchResultNavigation } from "~/features/search/hooks/useSearchResultNavigation";

export function SearchBtn() {
  const { anchorRef, close, frame, inputRef, isOpen, open, query, setQuery } =
    useSearchTransition();
  const shellRef = useRef<HTMLDivElement>(null);

  const handleConfirmIndex = useCallback(
    (index: number) => {
      const selectedResult = MOCK_SEARCH_RESULTS[index];

      if (!selectedResult) {
        return;
      }

      console.info(`[Search] selected: ${selectedResult.title}`);
      close();
    },
    [close]
  );

  const { resetSelection, selectedIndex, setSelectedIndex } =
    useSearchResultNavigation({
      isOpen,
      resultCount: MOCK_SEARCH_RESULTS.length,
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
                    onChange={setQuery}
                    onOpen={handleOpen}
                  />
                  <SearchExpandedBody isOpen={isOpen}>
                    <SearchResultsPanel
                      results={MOCK_SEARCH_RESULTS}
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

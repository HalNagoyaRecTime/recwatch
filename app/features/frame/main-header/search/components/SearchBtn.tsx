import { createPortal } from "react-dom";
import { useCallback, useRef } from "react";

import { SearchAnchor } from "~/features/frame/main-header/search/components/SearchAnchor";
import { SearchBackdrop } from "~/features/frame/main-header/search/components/SearchBackdrop";
import { SearchBarContent } from "~/features/frame/main-header/search/components/SearchBarContent";
import { SearchExpandedBody } from "~/features/frame/main-header/search/components/SearchExpandedBody";
import { SearchPositionContainer } from "~/features/frame/main-header/search/components/SearchPositionContainer";
import { SearchResultsPanel } from "~/features/frame/main-header/search/components/SearchResultsPanel";
import { SearchShell } from "~/features/frame/main-header/search/components/SearchShell";
import { useSearchTransition } from "~/features/frame/main-header/search/hooks/useSearchTransition";
import { SearchFooter } from "~/features/frame/main-header/search/components/SearchFooter";
import { MOCK_SEARCH_RESULTS } from "~/features/frame/main-header/search/constants/mockSearchResults";
import { useSearchResultNavigation } from "~/features/frame/main-header/search/hooks/useSearchResultNavigation";

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

  return (
    <>
      {/* domの場所確保用 */}
      <SearchAnchor anchorRef={anchorRef} />

      {typeof document !== "undefined"
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

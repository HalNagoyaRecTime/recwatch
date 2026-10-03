import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
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
import { useSearchGlobalShortcut } from "~/features/frame/main-header/search/hooks/useSearchGlobalShortcut";
import { useSearchResultNavigation } from "~/features/frame/main-header/search/hooks/useSearchResultNavigation";
import { filterNavigationSearchResults } from "~/features/frame/main-header/search/model/navigation-search";

const SEARCH_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getSearchFocusableElements(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(SEARCH_FOCUSABLE_SELECTOR)
  ).filter((element) => {
    const style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.tabIndex >= 0 &&
      !element.hasAttribute("aria-hidden")
    );
  });
}

export function SearchBtn() {
  const navigate = useNavigate();
  const {
    anchorRef,
    close,
    finishTransition,
    frame,
    geometryReady,
    geometryTransitionEnabled,
    inputRef,
    isOpen,
    open,
    positionRef,
    query,
    setQuery,
  } = useSearchTransition();
  const shellRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
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
    if (isOpen) {
      return;
    }

    const activeElement = document.activeElement;
    restoreFocusRef.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : null;
    resetSelection();
    open();
  }, [isOpen, open, resetSelection]);

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

  useSearchGlobalShortcut({
    isOpen,
    onClose: handleClose,
    onOpen: handleOpen,
  });

  const handleGeometryTransitionEnd = useCallback(
    (propertyName: string) => {
      if (propertyName === "width" || propertyName === "height") {
        finishTransition();
      }
    },
    [finishTransition]
  );

  useEffect(() => {
    if (!isOpen) {
      if (!wasOpenRef.current) {
        return;
      }

      wasOpenRef.current = false;
      const restoreTarget = restoreFocusRef.current;
      if (restoreTarget?.isConnected) {
        restoreTarget.focus();
        return;
      }

      const isMobile =
        typeof window.matchMedia === "function"
          ? window.matchMedia("(max-width: 767px)").matches
          : window.innerWidth < 768;
      (isMobile ? mobileTriggerRef.current : inputRef.current)?.focus();
      return;
    }

    wasOpenRef.current = true;

    if (!geometryReady) {
      return;
    }

    const shell = shellRef.current;
    const portal = portalRef.current;

    if (!shell || !portal) {
      return;
    }

    const previousInertState = new Map<HTMLElement, boolean>();
    for (const child of Array.from(document.body.children)) {
      if (child === portal || !(child instanceof HTMLElement)) {
        continue;
      }

      const wasInert = child.inert || child.hasAttribute("inert");
      previousInertState.set(child, wasInert);
      child.inert = true;
      child.setAttribute("inert", "");
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getSearchFocusableElements(shell);
      if (focusableElements.length === 0) {
        event.preventDefault();
        shell.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements.at(-1)!;
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === first || !shell.contains(activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === last || !shell.contains(activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousInertState.forEach((wasInert, element) => {
        if (wasInert) {
          element.inert = true;
          element.setAttribute("inert", "");
        } else {
          element.inert = false;
          element.removeAttribute("inert");
        }
      });
    };
  }, [geometryReady, inputRef, isOpen, mobileTriggerRef]);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <>
      <SearchAnchor anchorRef={anchorRef} />

      {isMounted && geometryReady && frame
        ? createPortal(
            <div ref={portalRef} data-search-portal>
              <SearchBackdrop isActive={isOpen} onClose={handleClose} />
              <SearchPositionContainer
                frame={frame}
                geometryTransitionEnabled={geometryTransitionEnabled}
                positionRef={positionRef}
                onGeometryTransitionEnd={handleGeometryTransitionEnd}
              >
                <SearchShell
                  rootRef={shellRef}
                  isOpen={isOpen}
                  geometryTransitionEnabled={geometryTransitionEnabled}
                >
                  <SearchBarContent
                    inputRef={inputRef}
                    mobileTriggerRef={mobileTriggerRef}
                    activeResultId={
                      isOpen && results[selectedIndex]
                        ? `navigation-search-option-${results[selectedIndex].id}`
                        : undefined
                    }
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
            </div>,
            document.body
          )
        : null}
    </>
  );
}

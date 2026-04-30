import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const SEARCH_RESULT_KEY_DOWN = "ArrowDown";
const SEARCH_RESULT_KEY_UP = "ArrowUp";
const SEARCH_RESULT_KEY_CONFIRM = "Enter";

type UseSearchResultNavigationParams = {
  isOpen: boolean;
  resultCount: number;
  onConfirmIndex: (index: number) => void;
  scopeRef?: RefObject<HTMLElement | null>;
};

export function useSearchResultNavigation({
  isOpen,
  resultCount,
  onConfirmIndex,
  scopeRef,
}: UseSearchResultNavigationParams) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);

  const resetSelection = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    if (!isOpen || resultCount === 0) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const shouldIgnoreKeyboardEvent =
        event.isComposing ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey;

      if (shouldIgnoreKeyboardEvent) {
        return;
      }

      const target = event.target as Node | null;
      const scopeElement = scopeRef?.current;

      if (scopeElement && target && !scopeElement.contains(target)) {
        return;
      }

      if (event.key === SEARCH_RESULT_KEY_DOWN) {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % resultCount);
      }

      if (event.key === SEARCH_RESULT_KEY_UP) {
        event.preventDefault();
        setSelectedIndex(
          (current) => (current - 1 + resultCount) % resultCount
        );
      }

      if (event.key === SEARCH_RESULT_KEY_CONFIRM) {
        event.preventDefault();
        onConfirmIndex(selectedIndexRef.current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onConfirmIndex, resultCount, scopeRef]);

  return {
    resetSelection,
    selectedIndex,
    setSelectedIndex,
  };
}

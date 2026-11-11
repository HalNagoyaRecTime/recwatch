import type { RefObject, SetStateAction } from "react";
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
    selectedIndexRef.current = 0;
    setSelectedIndex(0);
  }, []);

  const selectIndex = useCallback(
    (nextIndex: SetStateAction<number>) => {
      setSelectedIndex((current) => {
        const next =
          typeof nextIndex === "function" ? nextIndex(current) : nextIndex;
        const bounded =
          resultCount === 0 ? 0 : Math.min(Math.max(next, 0), resultCount - 1);
        selectedIndexRef.current = bounded;
        return bounded;
      });
    },
    [resultCount]
  );

  const moveSelection = useCallback(
    (nextIndex: (current: number) => number) => {
      selectIndex(nextIndex);
    },
    [selectIndex]
  );

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    selectIndex(selectedIndexRef.current);
  }, [resultCount, selectIndex]);

  useEffect(() => {
    if (!isOpen || resultCount === 0) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const shouldIgnoreKeyboardEvent =
        event.isComposing ||
        event.keyCode === 229 ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey;

      if (shouldIgnoreKeyboardEvent) {
        return;
      }

      const target = event.target;
      const scopeElement = scopeRef?.current;

      if (
        scopeElement &&
        target instanceof Node &&
        !scopeElement.contains(target)
      ) {
        return;
      }

      if (event.key === SEARCH_RESULT_KEY_DOWN) {
        event.preventDefault();
        moveSelection((current) => (current + 1) % resultCount);
      }

      if (event.key === SEARCH_RESULT_KEY_UP) {
        event.preventDefault();
        moveSelection((current) => (current - 1 + resultCount) % resultCount);
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
  }, [isOpen, moveSelection, onConfirmIndex, resultCount, scopeRef]);

  return {
    resetSelection,
    selectedIndex,
    setSelectedIndex: selectIndex,
  };
}

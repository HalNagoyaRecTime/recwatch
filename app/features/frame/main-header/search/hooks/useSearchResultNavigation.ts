import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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
      if (
        event.isComposing ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      const target = event.target as Node | null;
      const scopeElement = scopeRef?.current;

      if (scopeElement && target && !scopeElement.contains(target)) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % resultCount);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(
          (current) => (current - 1 + resultCount) % resultCount
        );
      }

      if (event.key === "Enter") {
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

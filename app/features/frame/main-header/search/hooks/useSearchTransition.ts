import { useCallback, useEffect, useRef, useState } from "react";

import { useSearchBodyScrollLock } from "~/features/frame/main-header/search/hooks/useSearchBodyScrollLock";
import { useSearchFrame } from "~/features/frame/main-header/search/hooks/useSearchFrame";
import { useSearchGlobalShortcut } from "~/features/frame/main-header/search/hooks/useSearchGlobalShortcut";

const SEARCH_OPEN_FOCUS_DELAY_MS = 220;

export function useSearchTransition() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { anchorRef, frame, transitionFrame } = useSearchFrame({ isOpen });

  const open = useCallback(() => {
    transitionFrame(true);
    setIsOpen(true);
  }, [transitionFrame]);

  const close = useCallback(() => {
    transitionFrame(false);
    setIsOpen(false);
    setQuery("");
  }, [transitionFrame]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => inputRef.current?.focus(),
      SEARCH_OPEN_FOCUS_DELAY_MS
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  useSearchBodyScrollLock({ isLocked: isOpen });
  useSearchGlobalShortcut({ isOpen, onClose: close, onOpen: open });

  return {
    anchorRef,
    close,
    frame,
    inputRef,
    isOpen,
    query,
    setQuery,
    open,
  };
}

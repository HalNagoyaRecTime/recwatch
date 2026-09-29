import { useCallback, useEffect, useRef, useState } from "react";

import { useDocumentScrollLock } from "~/hooks/useDocumentScrollLock";
import { useSearchFrame } from "~/features/frame/main-header/search/hooks/useSearchFrame";

export function useSearchTransition() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    anchorRef,
    finishTransition,
    frame,
    geometryReady,
    geometryTransitionEnabled,
    positionRef,
    transitionFrame,
  } = useSearchFrame();

  const open = useCallback(() => {
    if (isOpen) return;
    transitionFrame(true);
    setIsOpen(true);
  }, [isOpen, transitionFrame]);

  const close = useCallback(() => {
    if (!isOpen) return;
    transitionFrame(false);
    setIsOpen(false);
    setQuery("");
  }, [isOpen, transitionFrame]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [geometryReady, isOpen]);

  useDocumentScrollLock(isOpen);

  return {
    anchorRef,
    close,
    finishTransition,
    frame,
    geometryReady,
    geometryTransitionEnabled,
    inputRef,
    isOpen,
    positionRef,
    query,
    setQuery,
    open,
  };
}

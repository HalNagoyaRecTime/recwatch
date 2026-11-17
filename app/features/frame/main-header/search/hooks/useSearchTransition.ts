import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useDocumentScrollLock } from "~/hooks/useDocumentScrollLock";
import { useSearchFrame } from "~/features/frame/main-header/search/hooks/useSearchFrame";

const SEARCH_CLOSE_DURATION_MS = 400;

type SearchPhase = "closed" | "opening" | "open" | "closing";

export function useSearchTransition() {
  const [phase, setPhase] = useState<SearchPhase>("closed");
  const [query, setQuery] = useState("");
  const isOpen = phase === "open";
  const isOverlayActive = phase !== "closed";
  const inputRef = useRef<HTMLInputElement>(null);
  const wasOverlayActiveRef = useRef(false);
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
    if (phase === "opening" || phase === "open") {
      return;
    }

    // ヘッダー上のトリガー位置からPortalの検索面を広げる
    transitionFrame(false);
    setPhase("opening");
  }, [phase, transitionFrame]);

  const close = useCallback(() => {
    if (phase === "closed" || phase === "closing") {
      return;
    }

    transitionFrame(false);
    setPhase("closing");
    setQuery("");
  }, [phase, transitionFrame]);

  useLayoutEffect(() => {
    if (isOverlayActive) {
      inputRef.current?.focus({ preventScroll: true });
    } else if (
      wasOverlayActiveRef.current &&
      document.activeElement === document.body
    ) {
      inputRef.current?.closest("button")?.focus({ preventScroll: true });
    }

    wasOverlayActiveRef.current = isOverlayActive;
  }, [isOverlayActive]);

  useEffect(() => {
    if (phase !== "opening") {
      return;
    }

    let frameId = window.requestAnimationFrame(() => {
      frameId = window.requestAnimationFrame(() => {
        transitionFrame(true);
        setPhase("open");
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [phase, transitionFrame]);

  useEffect(() => {
    if (phase !== "closing") {
      return;
    }

    // 縮小が終わるまでPortalを残し、閉じた検索欄をヘッダーへ戻す
    const timeoutId = window.setTimeout(
      () => setPhase("closed"),
      SEARCH_CLOSE_DURATION_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

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

  useDocumentScrollLock(isOverlayActive);

  return {
    anchorRef,
    close,
    finishTransition,
    frame,
    geometryReady,
    geometryTransitionEnabled,
    inputRef,
    isOpen,
    isOverlayActive,
    positionRef,
    query,
    setQuery,
    open,
  };
}

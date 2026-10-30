import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useDocumentScrollLock } from "~/hooks/useDocumentScrollLock";
import { useSearchFrame } from "~/features/frame/main-header/search/hooks/useSearchFrame";
import { useSearchGlobalShortcut } from "~/features/frame/main-header/search/hooks/useSearchGlobalShortcut";

const SEARCH_OPEN_FOCUS_DELAY_MS = 220;
const SEARCH_CLOSE_DURATION_MS = 400;

type SearchPhase = "closed" | "opening" | "open" | "closing";

export function useSearchTransition() {
  const [phase, setPhase] = useState<SearchPhase>("closed");
  const isOpen = phase === "open";
  const isOverlayActive = phase !== "closed";
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wasOverlayActiveRef = useRef(false);
  const { anchorRef, frame, transitionFrame } = useSearchFrame({ isOpen });

  const open = useCallback(() => {
    if (phase === "opening" || phase === "open") {
      return;
    }

    if (phase === "closed") {
      // ヘッダーの位置でPortalを描画してから展開する。
      transitionFrame(false);
      setPhase("opening");
      return;
    }

    transitionFrame(true);
    setPhase("open");
  }, [phase, transitionFrame]);

  const close = useCallback(() => {
    transitionFrame(false);
    setPhase((current) => (current === "closed" ? current : "closing"));
    setQuery("");
  }, [transitionFrame]);

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

    // 縮小が終わるまでPortalを残し、閉じた検索欄をヘッダーへ戻す。
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

    const timeoutId = window.setTimeout(
      () => inputRef.current?.focus(),
      SEARCH_OPEN_FOCUS_DELAY_MS
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  useDocumentScrollLock(isOverlayActive);
  useSearchGlobalShortcut({
    isOpen: isOverlayActive,
    onClose: close,
    onOpen: open,
  });

  return {
    anchorRef,
    close,
    frame,
    inputRef,
    isOpen,
    isOverlayActive,
    query,
    setQuery,
    open,
  };
}

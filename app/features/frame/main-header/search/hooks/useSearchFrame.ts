import { autoUpdate } from "@floating-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  calculateSearchFrame,
  getSearchViewport,
  isSameSearchFrame,
  type SearchFrame,
} from "~/features/frame/main-header/search/model/search-geometry";

function measureFrame(anchor: HTMLDivElement, isOpen: boolean): SearchFrame {
  return calculateSearchFrame(
    anchor.getBoundingClientRect(),
    getSearchViewport(window),
    isOpen
  );
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useSearchFrame() {
  const [frame, setFrame] = useState<SearchFrame | null>(null);
  const [geometryReady, setGeometryReady] = useState(false);
  const [geometryTransitionEnabled, setGeometryTransitionEnabled] =
    useState(false);
  const anchorElementRef = useRef<HTMLDivElement | null>(null);
  const positionElementRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<SearchFrame | null>(null);
  const isOpenRef = useRef(false);

  const writeFrame = useCallback(
    (nextFrame: SearchFrame, allowTransition: boolean) => {
      if (isSameSearchFrame(frameRef.current, nextFrame)) {
        setGeometryTransitionEnabled(false);
        return false;
      }

      frameRef.current = nextFrame;
      setFrame(nextFrame);
      setGeometryTransitionEnabled(allowTransition);
      return true;
    },
    []
  );

  const anchorRef = useCallback(
    (node: HTMLDivElement | null) => {
      anchorElementRef.current = node;

      if (!node) {
        frameRef.current = null;
        setFrame(null);
        setGeometryReady(false);
        setGeometryTransitionEnabled(false);
        return;
      }

      writeFrame(measureFrame(node, false), false);
      setGeometryReady(true);
    },
    [writeFrame]
  );

  const positionRef = useCallback((node: HTMLDivElement | null) => {
    positionElementRef.current = node;
  }, []);

  const synchronizeFrame = useCallback(() => {
    const anchor = anchorElementRef.current;

    if (!anchor || !frameRef.current) {
      return;
    }

    writeFrame(measureFrame(anchor, isOpenRef.current), false);
  }, [writeFrame]);

  const transitionFrame = useCallback(
    (nextIsOpen: boolean) => {
      isOpenRef.current = nextIsOpen;
      const anchor = anchorElementRef.current;

      if (!anchor) {
        setGeometryTransitionEnabled(false);
        return;
      }

      writeFrame(measureFrame(anchor, nextIsOpen), !prefersReducedMotion());
    },
    [writeFrame]
  );

  const finishTransition = useCallback(() => {
    setGeometryTransitionEnabled(false);
  }, []);

  useEffect(() => {
    const anchor = anchorElementRef.current;
    const position = positionElementRef.current;

    if (!geometryReady || !anchor || !position) {
      return;
    }

    const stopAutoUpdate = autoUpdate(anchor, position, synchronizeFrame, {
      elementResize: false,
    });
    const header = anchor.closest("header");
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(synchronizeFrame);

    resizeObserver?.observe(anchor);
    if (header) resizeObserver?.observe(header);

    const visualViewport = window.visualViewport;
    window.addEventListener("orientationchange", synchronizeFrame);
    visualViewport?.addEventListener("resize", synchronizeFrame);
    visualViewport?.addEventListener("scroll", synchronizeFrame);

    return () => {
      stopAutoUpdate();
      resizeObserver?.disconnect();
      window.removeEventListener("orientationchange", synchronizeFrame);
      visualViewport?.removeEventListener("resize", synchronizeFrame);
      visualViewport?.removeEventListener("scroll", synchronizeFrame);
    };
  }, [geometryReady, synchronizeFrame]);

  return {
    anchorRef,
    frame,
    geometryReady,
    geometryTransitionEnabled,
    positionRef,
    transitionFrame,
    finishTransition,
  };
}

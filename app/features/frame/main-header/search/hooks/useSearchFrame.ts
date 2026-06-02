import { useCallback, useEffect, useRef, useState } from "react";

type SearchFrame = {
  height: number;
  right: number;
  top: number | string;
  width: number;
  transform: string;
};

const SEARCH_OPEN_MAX_WIDTH = 720;
const SEARCH_VIEWPORT_GUTTER = 32;
const SEARCH_OPEN_HEIGHT_RATIO = 0.8;

function createDefaultFrame(): SearchFrame {
  return {
    height: 0,
    width: 0,
    right: 0,
    top: 0,
    transform: "translate3d(0,0,0)",
  };
}

type UseSearchFrameParams = {
  isOpen: boolean;
};

export function useSearchFrame({ isOpen }: UseSearchFrameParams) {
  const [frame, setFrame] = useState<SearchFrame>(createDefaultFrame);
  const anchorElementRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const clearPendingFrames = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const getOpenWidth = useCallback((viewportWidth: number) => {
    return Math.min(
      viewportWidth - SEARCH_VIEWPORT_GUTTER,
      SEARCH_OPEN_MAX_WIDTH
    );
  }, []);

  const updateFrame = useCallback(
    (nextIsOpen: boolean) => {
      const anchor = anchorElementRef.current;

      if (!anchor || typeof window === "undefined") {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const openWidth = getOpenWidth(window.innerWidth);
      const openHeight = window.innerHeight * SEARCH_OPEN_HEIGHT_RATIO;
      const openRight = (window.innerWidth - openWidth) / 2;
      const closedRight = window.innerWidth - rect.right;

      setFrame({
        height: nextIsOpen ? openHeight : rect.height,
        right: nextIsOpen ? openRight : closedRight,
        top: nextIsOpen ? "50%" : rect.top,
        width: nextIsOpen ? openWidth : rect.width,
        transform: nextIsOpen ? "translate3d(0,-50%,0)" : "translate3d(0,0,0)",
      });
    },
    [getOpenWidth]
  );

  const anchorRef = useCallback(
    (node: HTMLDivElement | null) => {
      anchorElementRef.current = node;

      if (!node || typeof window === "undefined") {
        return;
      }

      setFrame((currentFrame) => {
        const rect = node.getBoundingClientRect();
        const openWidth = getOpenWidth(window.innerWidth);
        const openHeight = window.innerHeight * SEARCH_OPEN_HEIGHT_RATIO;
        const openRight = (window.innerWidth - openWidth) / 2;
        const closedRight = window.innerWidth - rect.right;
        const nextIsOpen = currentFrame.top === "50%";

        return {
          height: nextIsOpen ? openHeight : rect.height,
          right: nextIsOpen ? openRight : closedRight,
          top: nextIsOpen ? "50%" : rect.top,
          width: nextIsOpen ? openWidth : rect.width,
          transform: nextIsOpen
            ? "translate3d(0,-50%,0)"
            : "translate3d(0,0,0)",
        };
      });
    },
    [getOpenWidth]
  );

  const scheduleFrameUpdate = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      updateFrame(isOpen);
      frameRef.current = null;
    });
  }, [isOpen, updateFrame]);

  const transitionFrame = useCallback(
    (nextIsOpen: boolean) => {
      clearPendingFrames();
      updateFrame(nextIsOpen);
      frameRef.current = window.requestAnimationFrame(() => {
        updateFrame(nextIsOpen);
        frameRef.current = null;
      });
    },
    [clearPendingFrames, updateFrame]
  );

  useEffect(() => {
    function handleResize() {
      scheduleFrameUpdate();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [scheduleFrameUpdate]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    function handleScroll() {
      scheduleFrameUpdate();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, scheduleFrameUpdate]);

  useEffect(() => {
    return () => {
      clearPendingFrames();
    };
  }, [clearPendingFrames]);

  return {
    anchorRef,
    frame,
    transitionFrame,
  };
}

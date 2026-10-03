export type SearchFrame = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type SearchRect = Pick<DOMRect, "top" | "left" | "width" | "height">;

export type SearchViewport = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type VisualViewportMetrics = {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  height: number;
};

type SearchViewportSource = {
  innerWidth: number;
  innerHeight: number;
  visualViewport?: VisualViewportMetrics | null;
};

const SEARCH_OPEN_MAX_WIDTH = 720;
const SEARCH_OPEN_HEIGHT_RATIO = 0.8;
const SEARCH_DESKTOP_GUTTER = 32;
const SEARCH_MOBILE_GUTTER = 16;
const SEARCH_MOBILE_BREAKPOINT = 768;
const SEARCH_MIN_VERTICAL_GUTTER = 12;

export function getSearchViewport(
  source: SearchViewportSource
): SearchViewport {
  const visualViewport = source.visualViewport;

  return {
    top: visualViewport?.offsetTop ?? 0,
    left: visualViewport?.offsetLeft ?? 0,
    width: visualViewport?.width ?? source.innerWidth,
    height: visualViewport?.height ?? source.innerHeight,
  };
}

export function calculateSearchFrame(
  anchorRect: SearchRect,
  viewport: SearchViewport,
  isOpen: boolean
): SearchFrame {
  if (!isOpen) {
    return roundFrame({
      top: anchorRect.top,
      left: anchorRect.left,
      width: anchorRect.width,
      height: anchorRect.height,
    });
  }

  const isMobile = viewport.width < SEARCH_MOBILE_BREAKPOINT;
  const horizontalGutter = isMobile
    ? SEARCH_MOBILE_GUTTER
    : SEARCH_DESKTOP_GUTTER;
  const width = Math.max(
    0,
    Math.min(SEARCH_OPEN_MAX_WIDTH, viewport.width - horizontalGutter * 2)
  );
  const height = Math.max(
    0,
    Math.min(
      viewport.height * SEARCH_OPEN_HEIGHT_RATIO,
      viewport.height - SEARCH_MIN_VERTICAL_GUTTER * 2
    )
  );

  return roundFrame({
    top: viewport.top + (viewport.height - height) / 2,
    left: viewport.left + (viewport.width - width) / 2,
    width,
    height,
  });
}

export function isSameSearchFrame(
  first: SearchFrame | null,
  second: SearchFrame
): boolean {
  if (!first) {
    return false;
  }

  return (
    Math.abs(first.top - second.top) < 0.5 &&
    Math.abs(first.left - second.left) < 0.5 &&
    Math.abs(first.width - second.width) < 0.5 &&
    Math.abs(first.height - second.height) < 0.5
  );
}

function roundFrame(frame: SearchFrame): SearchFrame {
  return {
    top: roundPixel(frame.top),
    left: roundPixel(frame.left),
    width: roundPixel(frame.width),
    height: roundPixel(frame.height),
  };
}

function roundPixel(value: number) {
  return Math.round(value * 2) / 2;
}

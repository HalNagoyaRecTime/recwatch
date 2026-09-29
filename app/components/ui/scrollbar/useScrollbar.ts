import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";

import type {
  ScrollAxis,
  ScrollbarTarget,
} from "~/components/ui/scrollbar/scrollbar-target";

const HIDE_DELAY_MS = 300;
const MIN_THUMB_SIZE = 24;

type ScrollOrientation = "vertical" | "horizontal" | "both";

type ThumbMetrics = {
  size: number;
  offset: number;
};

type ThumbMetricsByAxis = Record<ScrollAxis, ThumbMetrics>;
type DraggingByAxis = Record<ScrollAxis, boolean>;

export type ScrollbarAxisState = {
  thumbSize: number;
  thumbOffset: number;
  isDragging: boolean;
  onThumbPointerDown: (event: PointerEvent) => void;
  onThumbPointerMove: (event: PointerEvent) => void;
  onThumbPointerUp: (event: PointerEvent) => void;
  onThumbPointerCancel: (event: PointerEvent) => void;
  onTrackPointerDown: (event: PointerEvent) => void;
};

export type ScrollbarState = {
  verticalTrackRef: RefObject<HTMLDivElement | null>;
  horizontalTrackRef: RefObject<HTMLDivElement | null>;
  vertical: ScrollbarAxisState;
  horizontal: ScrollbarAxisState;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function calculateThumbMetrics(
  scrollSize: number,
  viewportSize: number,
  trackSize: number,
  position: number
): ThumbMetrics {
  if (scrollSize <= viewportSize || viewportSize <= 0 || trackSize <= 0) {
    return { size: 0, offset: 0 };
  }

  const size = Math.min(
    trackSize,
    Math.max(MIN_THUMB_SIZE, (viewportSize / scrollSize) * trackSize)
  );
  const maxScroll = scrollSize - viewportSize;
  const maxOffset = Math.max(0, trackSize - size);
  const ratio = Math.max(0, Math.min(position / maxScroll, 1));

  return { size, offset: ratio * maxOffset };
}

function getPointerPosition(event: PointerEvent, axis: ScrollAxis) {
  return axis === "vertical" ? event.clientY : event.clientX;
}

function getTrackSize(track: HTMLElement, axis: ScrollAxis) {
  return axis === "vertical" ? track.clientHeight : track.clientWidth;
}

export function useScrollbar({
  orientation = "vertical",
  target,
}: {
  orientation?: ScrollOrientation;
  target: ScrollbarTarget;
}): ScrollbarState {
  const verticalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const [thumbMetrics, setThumbMetrics] = useState<ThumbMetricsByAxis>({
    vertical: { size: 0, offset: 0 },
    horizontal: { size: 0, offset: 0 },
  });
  const [dragging, setDragging] = useState<DraggingByAxis>({
    vertical: false,
    horizontal: false,
  });
  const draggingRef = useRef<DraggingByAxis>({
    vertical: false,
    horizontal: false,
  });
  const thumbSizeRef = useRef<Record<ScrollAxis, number>>({
    vertical: 0,
    horizontal: 0,
  });
  const dragStartRef = useRef<
    Record<ScrollAxis, { pointer: number; scroll: number }>
  >({
    vertical: { pointer: 0, scroll: 0 },
    horizontal: { pointer: 0, scroll: 0 },
  });
  const isHoveringRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsVisible(true);
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      if (
        !isHoveringRef.current &&
        !draggingRef.current.vertical &&
        !draggingRef.current.horizontal
      ) {
        setIsVisible(false);
      }
    }, HIDE_DELAY_MS);
  }, []);

  const recalculate = useCallback(() => {
    const axes: ScrollAxis[] =
      orientation === "both" ? ["vertical", "horizontal"] : [orientation];

    for (const axis of axes) {
      const track =
        axis === "vertical"
          ? verticalTrackRef.current
          : horizontalTrackRef.current;
      if (!track) continue;

      const metrics = target.getMetrics(axis);
      const trackSize = getTrackSize(track, axis);
      const next = calculateThumbMetrics(
        metrics.scrollSize,
        metrics.viewportSize,
        trackSize,
        metrics.position
      );
      thumbSizeRef.current[axis] = next.size;
      setThumbMetrics((previous) => {
        const current = previous[axis];
        if (current.size === next.size && current.offset === next.offset) {
          return previous;
        }
        return { ...previous, [axis]: next };
      });
    }
  }, [orientation, target, verticalTrackRef, horizontalTrackRef]);

  const onScroll = useCallback(() => {
    recalculate();
    resetHideTimer();
  }, [recalculate, resetHideTimer]);

  useEffect(() => {
    const unsubscribeScroll = target.subscribeScroll(onScroll);
    const unsubscribeSize = target.observeSize(recalculate);
    const initialMeasureTimer = window.setTimeout(recalculate, 0);

    return () => {
      window.clearTimeout(initialMeasureTimer);
      unsubscribeScroll();
      unsubscribeSize();
    };
  }, [onScroll, recalculate, target]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    []
  );

  const onMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const onMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    resetHideTimer();
  }, [resetHideTimer]);

  const startThumbDrag = useCallback(
    (axis: ScrollAxis, event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStartRef.current[axis] = {
        pointer: getPointerPosition(event, axis),
        scroll: target.getMetrics(axis).position,
      };
      draggingRef.current[axis] = true;
      setDragging((previous) => ({ ...previous, [axis]: true }));
      setIsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [target]
  );

  const moveThumb = useCallback(
    (axis: ScrollAxis, event: PointerEvent) => {
      if (!draggingRef.current[axis]) return;

      const track =
        axis === "vertical"
          ? verticalTrackRef.current
          : horizontalTrackRef.current;
      if (!track) return;

      const metrics = target.getMetrics(axis);
      const maxScroll = Math.max(0, metrics.scrollSize - metrics.viewportSize);
      const maxOffset = Math.max(
        0,
        getTrackSize(track, axis) - thumbSizeRef.current[axis]
      );
      const ratio = maxOffset > 0 ? maxScroll / maxOffset : 0;
      const start = dragStartRef.current[axis];
      const delta = (getPointerPosition(event, axis) - start.pointer) * ratio;

      target.setPosition(
        axis,
        Math.max(0, Math.min(maxScroll, start.scroll + delta))
      );
    },
    [target, verticalTrackRef, horizontalTrackRef]
  );

  const finishThumbDrag = useCallback(
    (axis: ScrollAxis, event: PointerEvent) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingRef.current[axis] = false;
      setDragging((previous) => ({ ...previous, [axis]: false }));
      resetHideTimer();
    },
    [resetHideTimer]
  );

  const moveToTrackPosition = useCallback(
    (axis: ScrollAxis, event: PointerEvent) => {
      event.preventDefault();
      const track =
        axis === "vertical"
          ? verticalTrackRef.current
          : horizontalTrackRef.current;
      if (!track) return;

      const metrics = target.getMetrics(axis);
      const trackRect = track.getBoundingClientRect();
      const trackStart = axis === "vertical" ? trackRect.top : trackRect.left;
      const clickOffset = getPointerPosition(event, axis) - trackStart;
      const targetOffset = clickOffset - thumbSizeRef.current[axis] / 2;
      const maxOffset = Math.max(
        0,
        getTrackSize(track, axis) - thumbSizeRef.current[axis]
      );
      const ratio =
        maxOffset > 0
          ? Math.max(0, Math.min(targetOffset, maxOffset)) / maxOffset
          : 0;
      const maxScroll = Math.max(0, metrics.scrollSize - metrics.viewportSize);

      target.setPosition(axis, ratio * maxScroll);
      resetHideTimer();
    },
    [resetHideTimer, target, verticalTrackRef, horizontalTrackRef]
  );

  const createAxisState = (axis: ScrollAxis): ScrollbarAxisState => ({
    thumbSize: thumbMetrics[axis].size,
    thumbOffset: thumbMetrics[axis].offset,
    isDragging: dragging[axis],
    onThumbPointerDown: (event) => startThumbDrag(axis, event),
    onThumbPointerMove: (event) => moveThumb(axis, event),
    onThumbPointerUp: (event) => finishThumbDrag(axis, event),
    onThumbPointerCancel: (event) => finishThumbDrag(axis, event),
    onTrackPointerDown: (event) => moveToTrackPosition(axis, event),
  });

  return {
    verticalTrackRef,
    horizontalTrackRef,
    vertical: createAxisState("vertical"),
    horizontal: createAxisState("horizontal"),
    isVisible,
    onMouseEnter,
    onMouseLeave,
  };
}

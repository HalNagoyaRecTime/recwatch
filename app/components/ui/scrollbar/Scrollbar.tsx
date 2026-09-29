import type { RefObject } from "react";

import { cn } from "~/lib/cn";
import type { ScrollbarAxisState } from "~/components/ui/scrollbar/useScrollbar";

type ScrollbarProps = {
  /** スクロールバーの方向 */
  orientation: "vertical" | "horizontal";
  /** 共通hookが計算した軸状態と操作 */
  axis: ScrollbarAxisState;
  /** トラック要素のref */
  trackRef: RefObject<HTMLDivElement | null>;
  /** 表示状態（透明度アニメーションに使う） */
  isVisible: boolean;
  /** 縦スクロールバーのトラック下端に空ける余白（px） */
  verticalTrackInsetBottom?: number;
};

/** 共通ロジックの軸状態を描画するScrollbarです。 */
export function Scrollbar({
  orientation,
  axis,
  trackRef,
  isVisible,
  verticalTrackInsetBottom = 0,
}: ScrollbarProps) {
  const isVertical = orientation === "vertical";
  const needsScrollbar = axis.thumbSize > 0;

  return (
    <div
      ref={trackRef}
      data-scrollbar-track={orientation}
      className={cn(
        "absolute cursor-default transition-opacity duration-200",
        isVertical ? "top-1 right-0.5 w-1.5" : "inset-x-1 bottom-0.5 h-1.5",
        needsScrollbar && isVisible
          ? "pointer-events-auto"
          : "pointer-events-none",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={
        isVertical
          ? { bottom: `calc(${verticalTrackInsetBottom}px + 0.25rem)` }
          : undefined
      }
      onPointerDown={axis.onTrackPointerDown}
    >
      {needsScrollbar && (
        <div
          data-scrollbar-thumb={orientation}
          className={cn(
            "pointer-events-auto absolute touch-none rounded-full transition-colors duration-150",
            isVertical ? "inset-x-0" : "inset-y-0",
            axis.isDragging
              ? "bg-text-subtle/70"
              : "bg-text-subtle/40 hover:bg-text-subtle/60"
          )}
          style={
            isVertical
              ? {
                  height: axis.thumbSize,
                  top: axis.thumbOffset,
                }
              : {
                  width: axis.thumbSize,
                  left: axis.thumbOffset,
                }
          }
          onPointerDown={axis.onThumbPointerDown}
          onPointerMove={axis.onThumbPointerMove}
          onPointerUp={axis.onThumbPointerUp}
          onPointerCancel={axis.onThumbPointerCancel}
        />
      )}
    </div>
  );
}

import type { ReactNode, CSSProperties } from "react";
import { cn } from "~/lib/cn";
import { useScrollbar } from "~/components/ui/scrollbar/useScrollbar";
import { Scrollbar } from "~/components/ui/scrollbar/Scrollbar";

type ScrollbarAreaProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * カスタムスクロールバー付きのスクロール領域。
 * - useScrollbar でロジックを管理
 * - Scrollbar で見た目を描画
 * - ネイティブスクロールバーは非表示
 */
export function ScrollbarArea({
  children,
  className,
  style,
}: ScrollbarAreaProps) {
  const {
    scrollRef,
    trackRef,
    thumbHeight,
    thumbTop,
    isVisible,
    isDragging,
    onThumbMouseDown,
    onScroll,
    onMouseEnter,
    onMouseLeave,
  } = useScrollbar();

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* スクロール領域（ネイティブバー非表示） */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn("scrollbar-none flex-1 overflow-y-scroll", className)}
        style={style}
      >
        {children}
      </div>

      {/* カスタムスクロールバー */}
      <Scrollbar
        trackRef={trackRef}
        thumbHeight={thumbHeight}
        thumbTop={thumbTop}
        isVisible={isVisible}
        isDragging={isDragging}
        onThumbMouseDown={onThumbMouseDown}
      />
    </div>
  );
}

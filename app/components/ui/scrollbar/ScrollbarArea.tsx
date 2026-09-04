import type { ReactNode, CSSProperties } from "react";
import { cn } from "~/lib/cn";
import { useScrollbar } from "~/components/ui/scrollbar/useScrollbar";
import { Scrollbar } from "~/components/ui/scrollbar/Scrollbar";

type ScrollbarAreaProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** スクロールバーの方向（デフォルト: "vertical"） */
  orientation?: "vertical" | "horizontal" | "both";
  /** 縦スクロールバーのトラック下端に空ける余白（px） */
  verticalTrackInsetBottom?: number;
  /** スクロール領域をTab順から外すなど、必要な画面だけ指定します。 */
  scrollTabIndex?: number;
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
  orientation = "vertical",
  verticalTrackInsetBottom = 0,
  scrollTabIndex,
}: ScrollbarAreaProps) {
  const {
    scrollRef,
    verticalTrackRef,
    horizontalTrackRef,
    verticalThumbHeight,
    verticalThumbTop,
    verticalIsDragging,
    onVerticalThumbPointerDown,
    onVerticalThumbPointerMove,
    onVerticalThumbPointerUp,
    onVerticalThumbPointerCancel,
    onVerticalTrackPointerDown,
    horizontalThumbWidth,
    horizontalThumbLeft,
    horizontalIsDragging,
    onHorizontalThumbPointerDown,
    onHorizontalThumbPointerMove,
    onHorizontalThumbPointerUp,
    onHorizontalThumbPointerCancel,
    onHorizontalTrackPointerDown,
    isVisible,
    onScroll,
    onMouseEnter,
    onMouseLeave,
  } = useScrollbar({ orientation });

  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* スクロール領域（ネイティブバー非表示） */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          "scrollbar-none min-w-0 flex-1",
          orientation === "vertical" && "overflow-x-hidden overflow-y-auto",
          orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
          orientation === "both" && "overflow-auto",
          className
        )}
        tabIndex={scrollTabIndex}
        style={style}
      >
        {children}
      </div>

      {/* 縦方向カスタムスクロールバー */}
      {showVertical && (
        <Scrollbar
          orientation="vertical"
          trackRef={verticalTrackRef}
          thumbSize={verticalThumbHeight}
          thumbOffset={verticalThumbTop}
          isVisible={isVisible}
          isDragging={verticalIsDragging}
          verticalTrackInsetBottom={verticalTrackInsetBottom}
          onThumbPointerDown={onVerticalThumbPointerDown}
          onThumbPointerMove={onVerticalThumbPointerMove}
          onThumbPointerUp={onVerticalThumbPointerUp}
          onThumbPointerCancel={onVerticalThumbPointerCancel}
          onTrackPointerDown={onVerticalTrackPointerDown}
        />
      )}

      {/* 横方向カスタムスクロールバー */}
      {showHorizontal && (
        <Scrollbar
          orientation="horizontal"
          trackRef={horizontalTrackRef}
          thumbSize={horizontalThumbWidth}
          thumbOffset={horizontalThumbLeft}
          isVisible={isVisible}
          isDragging={horizontalIsDragging}
          onThumbPointerDown={onHorizontalThumbPointerDown}
          onThumbPointerMove={onHorizontalThumbPointerMove}
          onThumbPointerUp={onHorizontalThumbPointerUp}
          onThumbPointerCancel={onHorizontalThumbPointerCancel}
          onTrackPointerDown={onHorizontalTrackPointerDown}
        />
      )}
    </div>
  );
}

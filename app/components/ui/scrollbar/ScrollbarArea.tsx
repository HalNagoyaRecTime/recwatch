import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

import { Scrollbar } from "~/components/ui/scrollbar/Scrollbar";
import { createElementScrollbarTarget } from "~/components/ui/scrollbar/scrollbar-target";
import { useScrollbar } from "~/components/ui/scrollbar/useScrollbar";
import { cn } from "~/lib/cn";

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

/** 独立したlocal scroll領域に共通Scrollbarを付けます。 */
export function ScrollbarArea({
  children,
  className,
  style,
  orientation = "vertical",
  verticalTrackInsetBottom = 0,
  scrollTabIndex,
}: ScrollbarAreaProps) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );
  const target = useMemo(
    () => createElementScrollbarTarget(() => scrollElement),
    [scrollElement]
  );
  const {
    verticalTrackRef,
    horizontalTrackRef,
    vertical,
    horizontal,
    isVisible,
    onMouseEnter,
    onMouseLeave,
  } = useScrollbar({ orientation, target });
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={setScrollElement}
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

      {showVertical && (
        <Scrollbar
          orientation="vertical"
          axis={vertical}
          trackRef={verticalTrackRef}
          isVisible={isVisible}
          verticalTrackInsetBottom={verticalTrackInsetBottom}
        />
      )}

      {showHorizontal && (
        <Scrollbar
          orientation="horizontal"
          axis={horizontal}
          trackRef={horizontalTrackRef}
          isVisible={isVisible}
        />
      )}
    </div>
  );
}

import { cn } from "~/lib/cn";

type ScrollbarProps = {
  /** スクロールバーの方向 */
  orientation: "vertical" | "horizontal";
  /** トラック要素に付けるref（常時DOMに存在させる） */
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** サムのサイズ（縦の場合は高さ、横の場合は幅）（px）。0のときはスクロール不要 */
  thumbSize: number;
  /** トラック先端からのオフセット（縦の場合は上端から、横の場合は左端から）（px） */
  thumbOffset: number;
  /** 表示状態（透明度アニメーションに使う） */
  isVisible: boolean;
  /** ドラッグ中（サムを強調するのに使う） */
  isDragging: boolean;
  /** 縦スクロールバーのトラック下端に空ける余白（px） */
  verticalTrackInsetBottom?: number;
  /** サムのmousedownハンドラー */
  onThumbMouseDown: (e: React.MouseEvent) => void;
  /** トラックのmousedownハンドラー */
  onTrackMouseDown: (e: React.MouseEvent) => void;
};

/**
 * スクロールバーの見た目のみを担当するコンポーネント。
 * 位置・サイズ計算のロジックは持たない。
 */
export function Scrollbar({
  orientation,
  trackRef,
  thumbSize,
  thumbOffset,
  isVisible,
  isDragging,
  verticalTrackInsetBottom = 0,
  onThumbMouseDown,
  onTrackMouseDown,
}: ScrollbarProps) {
  const isVertical = orientation === "vertical";
  const needsScrollbar = thumbSize > 0;

  return (
    // トラック：常時DOM上に存在。スクロール不要時は opacity-0 で隠す
    <div
      ref={trackRef}
      className={cn(
        "pointer-events-auto absolute cursor-default transition-opacity duration-200",
        isVertical ? "top-1 right-0.5 w-1.5" : "inset-x-1 bottom-0.5 h-1.5",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={
        isVertical
          ? { bottom: `calc(${verticalTrackInsetBottom}px + 0.25rem)` }
          : undefined
      }
      onMouseDown={onTrackMouseDown}
    >
      {/* サム：スクロール不要なら描画しない */}
      {needsScrollbar && (
        <div
          className={cn(
            "pointer-events-auto absolute rounded-full transition-colors duration-150",
            isVertical ? "inset-x-0" : "inset-y-0",
            isDragging
              ? "bg-text-subtle/70"
              : "bg-text-subtle/40 hover:bg-text-subtle/60"
          )}
          style={
            isVertical
              ? {
                  height: thumbSize,
                  top: thumbOffset,
                }
              : {
                  width: thumbSize,
                  left: thumbOffset,
                }
          }
          onMouseDown={onThumbMouseDown}
        />
      )}
    </div>
  );
}

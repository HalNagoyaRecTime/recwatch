import { cn } from "~/lib/cn";

type ScrollbarProps = {
  /** トラック要素に付けるref（常時DOMに存在させる） */
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** サムの高さ（px）。0のときはスクロール不要 */
  thumbHeight: number;
  /** トラック上端からのオフセット（px） */
  thumbTop: number;
  /** 表示状態（透明度アニメーションに使う） */
  isVisible: boolean;
  /** ドラッグ中（サムを強調するのに使う） */
  isDragging: boolean;
  /** サムのmousedownハンドラー */
  onThumbMouseDown: (e: React.MouseEvent) => void;
  /** トラックのmousedownハンドラー */
  onTrackMouseDown: (e: React.MouseEvent) => void;
};

/**
 * スクロールバーの見た目のみを担当するコンポーネント。
 * 位置・サイズ計算のロジックは持たない。
 *
 * trackは thumbHeight === 0（スクロール不要）でも常時DOMに存在する。
 * これにより useScrollbar が trackRef.current.clientHeight を
 * 常に正確に読める。
 */
export function Scrollbar({
  trackRef,
  thumbHeight,
  thumbTop,
  isVisible,
  isDragging,
  onThumbMouseDown,
  onTrackMouseDown,
}: ScrollbarProps) {
  const needsScrollbar = thumbHeight > 0;

  return (
    // トラック：常時DOM上に存在。スクロール不要時は opacity-0 で隠す
    <div
      ref={trackRef}
      className={cn(
        "absolute inset-y-1 right-0.5 w-1",
        "pointer-events-auto cursor-default",
        "transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onMouseDown={onTrackMouseDown}
    >
      {/* サム：スクロール不要なら描画しない */}
      {needsScrollbar && (
        <div
          className={cn(
            "absolute inset-x-0 rounded-full",
            "pointer-events-auto",
            "transition-colors duration-150",
            isDragging ? "bg-text-3/70" : "bg-text-3/40 hover:bg-text-3/60"
          )}
          style={{
            height: thumbHeight,
            top: thumbTop,
          }}
          onMouseDown={onThumbMouseDown}
        />
      )}
    </div>
  );
}

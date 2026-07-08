import { useCallback, useEffect, useRef, useState } from "react";

export type ScrollbarState = {
  /** サムの高さ（px）。0のときはスクロール不要 */
  thumbHeight: number;
  /** トラック上端からサムまでのオフセット（px） */
  thumbTop: number;
  /** スクロールバーを表示すべきか */
  isVisible: boolean;
  /** サムをドラッグ中か */
  isDragging: boolean;
  /** スクロール可能なコンテナに付けるref */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** トラック要素に付けるref（常時DOMに存在させることで高さを正確に読む） */
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** サムのmousedownハンドラー */
  onThumbMouseDown: (e: React.MouseEvent) => void;
  /** コンテナのscrollハンドラー */
  onScroll: () => void;
  /** コンテナのmouseenterハンドラー */
  onMouseEnter: () => void;
  /** コンテナのmouseleaveハンドラー */
  onMouseLeave: () => void;
};

const HIDE_DELAY_MS = 1000;

export function useScrollbar(): ScrollbarState {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const isHoveringRef = useRef(false);
  const thumbHeightRef = useRef(0);

  // サムの高さ・位置を再計算する
  // trackRef は常時 DOM に存在するため、デザイン層の詳細（inset等）に依存しない
  const recalculate = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const { scrollHeight, clientHeight, scrollTop } = el;
    const trackHeight = track.clientHeight;

    if (scrollHeight <= clientHeight) {
      setThumbHeight(0);
      thumbHeightRef.current = 0;
      return;
    }

    const ratio = clientHeight / scrollHeight;
    const newThumbHeight = Math.max(ratio * trackHeight, 24);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - newThumbHeight;
    const newThumbTop =
      maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setThumbHeight(newThumbHeight);
    thumbHeightRef.current = newThumbHeight;
    setThumbTop(newThumbTop);
  }, []);

  // スクロールバーの自動非表示タイマーをリセット
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsVisible(true);
    hideTimerRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setIsVisible(false);
      }
    }, HIDE_DELAY_MS);
  }, []);

  // コンテナリサイズを監視
  // ResizeObserver は observe() 直後に初回コールバックを自動発火するため
  // 手動での recalculate() 呼び出しは不要
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => recalculate());
    observer.observe(el);

    return () => observer.disconnect();
  }, [recalculate]);

  // ドラッグ中のmousemove / mouseupをdocumentで捕捉
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const el = scrollRef.current;
      const track = trackRef.current;
      if (!el || !track) return;

      const { scrollHeight, clientHeight } = el;
      const trackHeight = track.clientHeight;
      const ratio =
        (scrollHeight - clientHeight) / (trackHeight - thumbHeightRef.current);
      const delta = (e.clientY - dragStartYRef.current) * ratio;
      el.scrollTop = Math.max(0, dragStartScrollTopRef.current + delta);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      resetHideTimer();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, resetHideTimer]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const onScroll = useCallback(() => {
    recalculate();
    resetHideTimer();
  }, [recalculate, resetHideTimer]);

  const onMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const onMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    resetHideTimer();
  }, [resetHideTimer]);

  const onThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartYRef.current = e.clientY;
    dragStartScrollTopRef.current = scrollRef.current?.scrollTop ?? 0;
    setIsDragging(true);
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  return {
    thumbHeight,
    thumbTop,
    isVisible,
    isDragging,
    scrollRef,
    trackRef,
    onThumbMouseDown,
    onScroll,
    onMouseEnter,
    onMouseLeave,
  };
}

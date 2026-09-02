import { useCallback, useEffect, useRef, useState } from "react";

export type ScrollbarState = {
  /** スクロール可能なコンテナに付けるref */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** 縦トラック要素に付けるref */
  verticalTrackRef: React.RefObject<HTMLDivElement | null>;
  /** 横トラック要素に付けるref */
  horizontalTrackRef: React.RefObject<HTMLDivElement | null>;

  /** 縦サムの高さ（px）。0のときはスクロール不要 */
  verticalThumbHeight: number;
  /** 縦トラック上端から縦サムまでのオフセット（px） */
  verticalThumbTop: number;
  /** 縦サムをドラッグ中か */
  verticalIsDragging: boolean;
  /** 縦サムのpointerdownハンドラー */
  onVerticalThumbPointerDown: (e: React.PointerEvent) => void;
  /** 縦サムのpointermoveハンドラー */
  onVerticalThumbPointerMove: (e: React.PointerEvent) => void;
  /** 縦サムのpointerupハンドラー */
  onVerticalThumbPointerUp: (e: React.PointerEvent) => void;
  /** 縦サムのpointercancelハンドラー */
  onVerticalThumbPointerCancel: (e: React.PointerEvent) => void;
  /** 縦トラックのpointerdownハンドラー */
  onVerticalTrackPointerDown: (e: React.PointerEvent) => void;

  /** 横サムの幅（px）。0のときはスクロール不要 */
  horizontalThumbWidth: number;
  /** 横トラック左端から横サムまでのオフセット（px） */
  horizontalThumbLeft: number;
  /** 横サムをドラッグ中か */
  horizontalIsDragging: boolean;
  /** 横サムのpointerdownハンドラー */
  onHorizontalThumbPointerDown: (e: React.PointerEvent) => void;
  /** 横サムのpointermoveハンドラー */
  onHorizontalThumbPointerMove: (e: React.PointerEvent) => void;
  /** 横サムのpointerupハンドラー */
  onHorizontalThumbPointerUp: (e: React.PointerEvent) => void;
  /** 横サムのpointercancelハンドラー */
  onHorizontalThumbPointerCancel: (e: React.PointerEvent) => void;
  /** 横トラックのpointerdownハンドラー */
  onHorizontalTrackPointerDown: (e: React.PointerEvent) => void;

  /** スクロールバーを表示すべきか */
  isVisible: boolean;
  /** コンテナのscrollハンドラー */
  onScroll: () => void;
  /** コンテナのmouseenterハンドラー */
  onMouseEnter: () => void;
  /** コンテナのmouseleaveハンドラー */
  onMouseLeave: () => void;
};

const HIDE_DELAY_MS = 300;

export function useScrollbar(options?: {
  orientation?: "vertical" | "horizontal" | "both";
}): ScrollbarState {
  const orientation = options?.orientation ?? "vertical";
  const scrollRef = useRef<HTMLDivElement>(null);
  const verticalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  const [verticalThumbHeight, setVerticalThumbHeight] = useState(0);
  const [verticalThumbTop, setVerticalThumbTop] = useState(0);
  const [verticalIsDragging, setVerticalIsDragging] = useState(false);

  const [horizontalThumbWidth, setHorizontalThumbWidth] = useState(0);
  const [horizontalThumbLeft, setHorizontalThumbLeft] = useState(0);
  const [horizontalIsDragging, setHorizontalIsDragging] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const verticalThumbHeightRef = useRef(0);

  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const horizontalThumbWidthRef = useRef(0);

  const isHoveringRef = useRef(false);

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

  // サムの高さ・幅・位置を再計算する
  const recalculate = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 縦スクロールバーの再計算
    if (orientation === "vertical" || orientation === "both") {
      const track = verticalTrackRef.current;
      if (track) {
        const { scrollHeight, clientHeight, scrollTop } = el;
        const trackHeight = track.clientHeight;

        if (scrollHeight <= clientHeight) {
          setVerticalThumbHeight(0);
          verticalThumbHeightRef.current = 0;
        } else {
          const ratio = clientHeight / scrollHeight;
          const newThumbHeight = Math.max(ratio * trackHeight, 24);
          const maxScrollTop = scrollHeight - clientHeight;
          const maxThumbTop = trackHeight - newThumbHeight;
          const newThumbTop =
            maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

          setVerticalThumbHeight(newThumbHeight);
          verticalThumbHeightRef.current = newThumbHeight;
          setVerticalThumbTop(newThumbTop);
        }
      }
    }

    // 横スクロールバーの再計算
    if (orientation === "horizontal" || orientation === "both") {
      const track = horizontalTrackRef.current;
      if (track) {
        const { scrollWidth, clientWidth, scrollLeft } = el;
        const trackWidth = track.clientWidth;

        if (scrollWidth <= clientWidth) {
          setHorizontalThumbWidth(0);
          horizontalThumbWidthRef.current = 0;
        } else {
          const ratio = clientWidth / scrollWidth;
          const newThumbWidth = Math.max(ratio * trackWidth, 24);
          const maxScrollLeft = scrollWidth - clientWidth;
          const maxThumbLeft = trackWidth - newThumbWidth;
          const newThumbLeft =
            maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;

          setHorizontalThumbWidth(newThumbWidth);
          horizontalThumbWidthRef.current = newThumbWidth;
          setHorizontalThumbLeft(newThumbLeft);
        }
      }
    }
  }, [orientation]);

  // コンテナと内部コンテンツのサイズ変化を監視
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => recalculate());
    observer?.observe(el);
    Array.from(el.children).forEach((child) => observer?.observe(child));
    if (!observer) {
      queueMicrotask(recalculate);
    }

    const mutationObserver = new MutationObserver(() => {
      Array.from(el.children).forEach((child) => observer?.observe(child));
      recalculate();
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, [recalculate]);

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

  const onVerticalThumbPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartYRef.current = e.clientY;
    dragStartScrollTopRef.current = scrollRef.current?.scrollTop ?? 0;
    setVerticalIsDragging(true);
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const onVerticalThumbPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!verticalIsDragging) return;

      const el = scrollRef.current;
      const track = verticalTrackRef.current;
      if (!el || !track) return;

      const { scrollHeight, clientHeight } = el;
      const trackHeight = track.clientHeight;
      const ratio =
        (scrollHeight - clientHeight) /
        (trackHeight - verticalThumbHeightRef.current);
      const delta = (e.clientY - dragStartYRef.current) * ratio;
      el.scrollTop = Math.max(0, dragStartScrollTopRef.current + delta);
    },
    [verticalIsDragging]
  );

  const onVerticalThumbPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setVerticalIsDragging(false);
      resetHideTimer();
    },
    [resetHideTimer]
  );

  const onVerticalThumbPointerCancel = onVerticalThumbPointerUp;

  const onVerticalTrackPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const el = scrollRef.current;
    const track = verticalTrackRef.current;
    if (!el || !track) return;

    const trackRect = track.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;

    const thumbHalfHeight = verticalThumbHeightRef.current / 2;
    let targetThumbTop = clickY - thumbHalfHeight;

    const trackHeight = track.clientHeight;
    const maxThumbTop = trackHeight - verticalThumbHeightRef.current;

    targetThumbTop = Math.max(0, Math.min(targetThumbTop, maxThumbTop));

    const maxScrollTop = el.scrollHeight - el.clientHeight;
    const ratio = maxThumbTop > 0 ? targetThumbTop / maxThumbTop : 0;
    el.scrollTop = ratio * maxScrollTop;
  }, []);

  const onHorizontalThumbPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = scrollRef.current?.scrollLeft ?? 0;
    setHorizontalIsDragging(true);
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const onHorizontalThumbPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!horizontalIsDragging) return;

      const el = scrollRef.current;
      const track = horizontalTrackRef.current;
      if (!el || !track) return;

      const { scrollWidth, clientWidth } = el;
      const trackWidth = track.clientWidth;
      const ratio =
        (scrollWidth - clientWidth) /
        (trackWidth - horizontalThumbWidthRef.current);
      const delta = (e.clientX - dragStartXRef.current) * ratio;
      el.scrollLeft = Math.max(0, dragStartScrollLeftRef.current + delta);
    },
    [horizontalIsDragging]
  );

  const onHorizontalThumbPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setHorizontalIsDragging(false);
      resetHideTimer();
    },
    [resetHideTimer]
  );

  const onHorizontalThumbPointerCancel = onHorizontalThumbPointerUp;

  const onHorizontalTrackPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const el = scrollRef.current;
    const track = horizontalTrackRef.current;
    if (!el || !track) return;

    const trackRect = track.getBoundingClientRect();
    const clickX = e.clientX - trackRect.left;

    const thumbHalfWidth = horizontalThumbWidthRef.current / 2;
    let targetThumbLeft = clickX - thumbHalfWidth;

    const trackWidth = track.clientWidth;
    const maxThumbLeft = trackWidth - horizontalThumbWidthRef.current;

    targetThumbLeft = Math.max(0, Math.min(targetThumbLeft, maxThumbLeft));

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const ratio = maxThumbLeft > 0 ? targetThumbLeft / maxThumbLeft : 0;
    el.scrollLeft = ratio * maxScrollLeft;
  }, []);

  return {
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
  };
}

import React, { type ReactNode, type CSSProperties } from "react";

import { cn } from "~/lib/cn";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";

type LayeredPanelProps = {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  /** footerの余白モード。デフォルトは "auto" (px-5 py-4)。 */
  footerPadding?: "auto" | "none";
  header?: ReactNode;
  /**
   * 余白モード。デフォルトは "auto" (ヘッダー: px-5 py-4, ボディ: p-4)。
   * "none" に設定すると、ヘッダーとボディの余白（padding）がすべて 0 になり、カスタムレイアウトに対応できます。
   */
  padding?: "auto" | "none";
  /** 内部のスクロール可能なコンテナに適用するCSSスタイル */
  innerStyle?: CSSProperties;
  /** 指定時は本文を縦スクロールにし、見出しとフッターを固定します。 */
  scrollMaxHeight?: CSSProperties["maxHeight"];
  /** 一覧の切り替えを識別し、縦スクロール位置を先頭へ戻します。 */
  scrollResetKey?: string;
} & React.ComponentPropsWithoutRef<"section">;

/**
 * 使用例:
 * const header = <NotificationPanelHeader />;
 * <LayeredPanel header={header}><NotificationSummary /></LayeredPanel>
 */
export function LayeredPanel({
  children,
  className,
  footer,
  footerPadding = "auto",
  header,
  padding = "auto",
  innerStyle,
  scrollMaxHeight,
  scrollResetKey,
  ...props
}: LayeredPanelProps) {
  const isAutoPadding = padding === "auto";
  const isAutoFooterPadding = footerPadding === "auto";
  const hasVerticalScroll = scrollMaxHeight !== undefined;
  const footerContent = footer && (
    <div
      className={cn(
        "text-text-muted shrink-0",
        isAutoFooterPadding ? "px-5 py-4" : "p-0"
      )}
    >
      {footer}
    </div>
  );

  return (
    <section
      className={cn(
        "app-rounded border-border-base bg-surface-muted w-full min-w-0 overflow-hidden border",
        className
      )}
      {...props}
    >
      <ScrollbarArea
        orientation={hasVerticalScroll ? "both" : "horizontal"}
        className={cn(
          "-mx-px w-[calc(100%+2px)] px-px",
          hasVerticalScroll && "isolate overscroll-none"
        )}
        scrollResetKey={hasVerticalScroll ? scrollResetKey : undefined}
        scrollTabIndex={hasVerticalScroll ? 0 : undefined}
        style={hasVerticalScroll ? { maxHeight: scrollMaxHeight } : undefined}
      >
        <div style={innerStyle} className="flex w-fit min-w-full flex-col">
          {header && (
            <div
              className={cn(
                "text-text-muted shrink-0",
                hasVerticalScroll && "bg-surface-muted sticky top-0 z-20",
                isAutoPadding ? "px-5 py-2.5" : "p-0"
              )}
            >
              {header}
            </div>
          )}
          <div
            className={cn(
              "app-rounded border-border-base bg-surface-base -m-px shrink-0 overflow-hidden border",
              isAutoPadding ? "p-4" : "p-0"
            )}
          >
            {children}
          </div>
          {!hasVerticalScroll && footerContent}
        </div>
      </ScrollbarArea>
      {hasVerticalScroll && footerContent}
    </section>
  );
}

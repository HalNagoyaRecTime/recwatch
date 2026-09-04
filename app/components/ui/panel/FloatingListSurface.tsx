import type { HTMLAttributes, ReactNode } from "react";

import { floatingListSurfaceStyle } from "~/components/ui/panel/styles/floating-list-styles";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";

type FloatingListSurfaceProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "className"
> & {
  children: ReactNode;
  /** スクロール領域の外側に固定表示するヘッダーです。 */
  fixedHeader?: ReactNode;
  /** 利用可能サイズ内で内容を縦スクロールさせます。 */
  scrollable?: boolean;
  /** スクロール領域のTab順を画面単位で調整します。 */
  scrollTabIndex?: number;
};

export function FloatingListSurface({
  children,
  fixedHeader,
  scrollable = false,
  scrollTabIndex,
  ...props
}: FloatingListSurfaceProps) {
  return (
    <div {...props} className={floatingListSurfaceStyle({ scrollable })}>
      {scrollable ? (
        <>
          {fixedHeader ? <div className="shrink-0">{fixedHeader}</div> : null}
          <ScrollbarArea
            className="min-h-0 p-2"
            scrollTabIndex={scrollTabIndex}
          >
            {children}
          </ScrollbarArea>
        </>
      ) : (
        <>
          {fixedHeader}
          {children}
        </>
      )}
    </div>
  );
}

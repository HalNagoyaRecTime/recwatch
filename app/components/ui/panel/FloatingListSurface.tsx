import type { HTMLAttributes, ReactNode } from "react";

import { floatingListSurfaceStyle } from "~/components/ui/panel/styles/floating-list-styles";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";

type FloatingListSurfaceProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "className"
> & {
  children: ReactNode;
  /** 利用可能サイズ内で内容を縦スクロールさせます。 */
  scrollable?: boolean;
};

export function FloatingListSurface({
  children,
  scrollable = false,
  ...props
}: FloatingListSurfaceProps) {
  return (
    <div {...props} className={floatingListSurfaceStyle({ scrollable })}>
      {scrollable ? (
        <ScrollbarArea className="p-2">{children}</ScrollbarArea>
      ) : (
        children
      )}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

import { floatingListSurfaceStyle } from "~/components/ui/panel/styles/floating-list-styles";

type FloatingListSurfaceProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "className"
> & {
  children: ReactNode;
};

export function FloatingListSurface({
  children,
  ...props
}: FloatingListSurfaceProps) {
  return (
    <div {...props} className={floatingListSurfaceStyle()}>
      {children}
    </div>
  );
}

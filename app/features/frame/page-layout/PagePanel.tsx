import type { ReactNode } from "react";

import { cva } from "~/lib/cva";

const pagePanelStyle = cva("min-w-0 bg-surface-layout", {
  variants: {
    placement: {
      left: "border-border-base border-r",
      right: "border-border-base border-l",
      top: "border-border-base border-b",
    },
  },
});

type PagePanelProps = {
  children: ReactNode;
  placement: "left" | "right" | "top";
};

export function PagePanel({ children, placement }: PagePanelProps) {
  if (placement === "top") {
    return (
      <aside className={pagePanelStyle({ placement }) + " main-header-height"}>
        <div className="flex h-full items-center px-4.5 md:px-6">
          {children}
        </div>
      </aside>
    );
  }

  return (
    <aside className={pagePanelStyle({ placement }) + " page-side-panel"}>
      <div className="h-full overflow-hidden">{children}</div>
    </aside>
  );
}

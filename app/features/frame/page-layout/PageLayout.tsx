import type { ReactNode } from "react";

import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import MainFooter from "~/features/frame/main-header/components/MainFooter";
import { PagePanel } from "~/features/frame/page-layout/PagePanel";

type PageLayoutProps = {
  children: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  top?: ReactNode;
};

export function PageLayout({ children, left, right, top }: PageLayoutProps) {
  const hasLeftPanel = left != null;
  const hasRightPanel = right != null;
  const hasTopPanel = top != null;
  const hasSidePanel = hasLeftPanel || hasRightPanel;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {hasTopPanel && <PagePanel placement="top">{top}</PagePanel>}
      <div
        className={
          hasSidePanel
            ? `grid min-h-0 flex-1 ${
                hasLeftPanel && hasRightPanel
                  ? "grid-cols-[auto_minmax(0,1fr)_auto]"
                  : hasLeftPanel
                    ? "grid-cols-[auto_minmax(0,1fr)]"
                    : "grid-cols-[minmax(0,1fr)_auto]"
              }`
            : "min-h-0 flex-1"
        }
      >
        {hasLeftPanel && <PagePanel placement="left">{left}</PagePanel>}
        <PageMain>{children}</PageMain>
        {hasRightPanel && <PagePanel placement="right">{right}</PagePanel>}
      </div>
    </div>
  );
}

function PageMain({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ScrollbarArea
        className="overscroll-y-contain"
        verticalTrackInsetBottom={42}
      >
        <div className="flex min-h-full flex-col">
          <div className="flex-1">{children}</div>
          <MainFooter />
        </div>
      </ScrollbarArea>
    </div>
  );
}

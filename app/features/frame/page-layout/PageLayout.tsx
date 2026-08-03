import type { ReactNode } from "react";

import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import MainFooter from "~/features/frame/main-header/components/MainFooter";
import { PagePanel } from "~/features/frame/page-layout/PagePanel";

type PagePanelConfig = {
  content: ReactNode;
  placement: "left" | "right" | "top";
};

type PageLayoutProps = {
  children: ReactNode;
  panel?: PagePanelConfig;
};

export function PageLayout({ children, panel }: PageLayoutProps) {
  if (!panel) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PageMain>{children}</PageMain>
      </div>
    );
  }

  if (panel.placement === "top") {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PagePanel placement="top">{panel.content}</PagePanel>
        <PageMain>{children}</PageMain>
      </div>
    );
  }

  return (
    <div
      className={
        panel.placement === "left"
          ? "grid h-full min-h-0 grid-cols-[auto_minmax(0,1fr)]"
          : "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_auto]"
      }
    >
      {panel.placement === "left" && (
        <PagePanel placement="left">{panel.content}</PagePanel>
      )}
      <PageMain>{children}</PageMain>
      {panel.placement === "right" && (
        <PagePanel placement="right">{panel.content}</PagePanel>
      )}
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

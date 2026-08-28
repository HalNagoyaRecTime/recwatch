import { cn } from "~/lib/cn";
import { PanelLeftCloseIcon } from "lucide-react";
import { useSidebarState } from "~/hooks/useSidebarState";

import { SIDEBAR_DURATION } from "~/features/frame/sidebar/styles/sidebar-styles";

type SidebarFooterProps = {
  mode?: "desktop" | "mobile";
};

export function SidebarFooter({ mode = "desktop" }: SidebarFooterProps) {
  const { closeForMobile, sidebarPinnedOpen, togglePinned } = useSidebarState();
  const isMobile = mode === "mobile";

  return (
    <div className="main-footer-height border-border-subtle flex border-t p-1 pl-3">
      <button
        type="button"
        className={cn(
          "app-rounded text-text-muted relative flex aspect-square h-full cursor-pointer items-center justify-center bg-transparent p-1 transition",
          "hover:bg-surface-hover hover:text-text-base"
        )}
        onClick={isMobile ? closeForMobile : togglePinned}
        aria-label={
          isMobile
            ? "サイドメニューを閉じる"
            : "サイドバーの固定表示を切り替える"
        }
        aria-pressed={isMobile ? undefined : sidebarPinnedOpen}
      >
        <PanelLeftCloseIcon
          className={cn(
            "transition-transform",
            SIDEBAR_DURATION,
            !sidebarPinnedOpen && !isMobile ? "scale-x-[-1]" : ""
          )}
        />
      </button>
    </div>
  );
}

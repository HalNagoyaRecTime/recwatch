import { cn } from "~/lib/cn";
import { PanelLeftCloseIcon } from "lucide-react";
import { useSidebarState } from "~/hooks/useSidebarState";

import { SIDEBAR_DURATION } from "~/features/frame/sidebar/styles/sidebar-styles";

export function SidebarFooter() {
  const { sidebarPinnedOpen, togglePinned } = useSidebarState();

  return (
    <div className="main-footer-height border-border-subtle flex border-t p-1 pl-3">
      <button
        type="button"
        className={cn(
          "app-rounded text-text-muted relative flex aspect-square h-full cursor-pointer items-center justify-center bg-transparent p-1 transition",
          "hover:bg-surface-hover hover:text-text-base"
        )}
        onClick={togglePinned}
        aria-label="サイドバーの固定表示を切り替える"
        aria-pressed={sidebarPinnedOpen}
      >
        <PanelLeftCloseIcon
          className={cn(
            "transition-transform",
            SIDEBAR_DURATION,
            !sidebarPinnedOpen ? "scale-x-[-1]" : ""
          )}
        />
      </button>
    </div>
  );
}

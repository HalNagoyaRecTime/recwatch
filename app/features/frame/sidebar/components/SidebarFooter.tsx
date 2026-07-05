import { cn } from "~/lib/cn";
import { PanelLeftCloseIcon } from "lucide-react";
import { useSidebarState } from "~/hooks/useSidebarState";

import { SIDEBAR_DURATION } from "~/features/frame/sidebar/styles/sidebar-styles";

export function SidebarFooter() {
  const { isOpen, toggle } = useSidebarState();

  return (
    <div className="main-footer-height border-border-1 flex border-t p-1 pl-3">
      <button
        type="button"
        className={cn(
          "app-rounded text-text-2 relative flex aspect-square h-full cursor-pointer items-center justify-center bg-transparent p-1 transition",
          "hover:bg-surface-2 hover:text-text-1"
        )}
        onClick={toggle}
      >
        <PanelLeftCloseIcon
          className={cn(
            "transition-transform",
            SIDEBAR_DURATION,
            !isOpen ? "scale-x-[-1]" : ""
          )}
        />
      </button>
    </div>
  );
}

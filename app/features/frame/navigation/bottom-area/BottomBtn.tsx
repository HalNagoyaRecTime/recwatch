import { cn } from "~/lib/cn";
import { PanelLeftCloseIcon } from "lucide-react";
import { useNavState } from "~/hooks/useNavState";

import { NAV_DURATION } from "~/features/frame/navigation/styles/sidebar-styles";

export function BottomBtn() {
  const { isOpen, toggle } = useNavState();

  return (
    <div className="main-footer-height flex border-t border-(--border-1) p-1 pl-3">
      <button
        type="button"
        className={cn(
          "app-rounded relative flex aspect-square h-full cursor-pointer items-center justify-center bg-transparent p-1 text-(--text-2) transition",
          "hover:bg-(--surface-2) hover:text-(--text-1)"
        )}
        onClick={toggle}
      >
        <PanelLeftCloseIcon
          className={cn(
            "transition-transform",
            NAV_DURATION,
            !isOpen ? "scale-x-[-1]" : ""
          )}
        />
      </button>
    </div>
  );
}

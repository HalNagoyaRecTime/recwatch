import { cn } from "~/lib/cn";
import { PanelLeftCloseIcon } from "lucide-react";
import { useNavState } from "~/hooks/useNavState";

export function BottomBtn() {
  const { isOpen, toggle } = useNavState();

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
            "transition-transform duration-200",
            !isOpen ? "scale-x-[-1]" : ""
          )}
        />
      </button>
    </div>
  );
}

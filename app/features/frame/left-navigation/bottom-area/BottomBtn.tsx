import { cn } from "~/lib/cn";
import { PanelLeftCloseIcon } from "lucide-react";
import { useNavState } from "~/hooks/useNavState";

export function BottomBtn() {
  const isOpen = useNavState((state) => state.isOpen);
  const toggle = useNavState((state) => state.toggle);
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
            "transition-transform duration-200",
            !isOpen ? "scale-x-[-1]" : ""
          )}
        />
      </button>
    </div>
  );
}

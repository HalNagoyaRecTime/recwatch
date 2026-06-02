import { cn } from "~/lib/cn";
import { Menu } from "lucide-react";
import { useNavState } from "~/hooks/useNavState";

export function MobileHamburgerMenuBtn() {
  const toggle = useNavState((state) => state.toggle);

  return (
    <button
      type="button"
      className={cn(
        "flex aspect-square h-full items-center justify-center rounded-lg border transition md:hidden",
        "border-(--border-2) bg-transparent text-(--text-2)",
        "hover:border-(--border-strong) hover:bg-(--surface-2) hover:text-(--text-1)"
      )}
      onClick={toggle}
      aria-label="Toggle navigation"
    >
      <Menu size={17} strokeWidth={1.8} />
    </button>
  );
}

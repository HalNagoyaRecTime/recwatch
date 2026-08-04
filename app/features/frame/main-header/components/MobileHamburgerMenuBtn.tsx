import { cn } from "~/lib/cn";
import { Menu } from "lucide-react";
import { useSidebarState } from "~/hooks/useSidebarState";

export function MobileHamburgerMenuBtn() {
  const { toggle } = useSidebarState();

  return (
    <button
      type="button"
      className={cn(
        "flex aspect-square h-full items-center justify-center rounded-lg border transition md:hidden",
        "border-border-base text-text-muted bg-transparent",
        "hover:border-border-strong hover:bg-surface-hover hover:text-text-base"
      )}
      onClick={toggle}
      aria-label="Toggle navigation"
    >
      <Menu size={17} strokeWidth={1.8} />
    </button>
  );
}

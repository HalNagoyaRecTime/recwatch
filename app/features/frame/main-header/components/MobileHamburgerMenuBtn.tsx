import { cn } from "~/lib/cn";
import { Menu } from "lucide-react";
import { useSidebarState } from "~/hooks/useSidebarState";

export function MobileHamburgerMenuBtn() {
  const { mobileOpen, toggleMobileDrawer } = useSidebarState();

  return (
    <button
      type="button"
      id="mobile-nav-trigger"
      className={cn(
        "flex aspect-square h-full items-center justify-center rounded-lg border transition md:hidden",
        "border-border-base text-text-muted bg-transparent",
        "hover:border-border-strong hover:bg-surface-hover hover:text-text-base"
      )}
      onClick={toggleMobileDrawer}
      aria-label="Toggle navigation"
      aria-expanded={mobileOpen}
      aria-controls="app-sidebar-mobile"
    >
      <Menu size={17} strokeWidth={1.8} />
    </button>
  );
}

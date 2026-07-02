import { useEffect } from "react";

import { useNavState } from "~/hooks/useNavState";
import { cn } from "~/lib/cn";

import { BottomBtn } from "~/features/layout/left-navigation/bottom-area/BottomBtn";
import { AppSidebar } from "~/features/layout/left-navigation/components/AppSidebar";
import { useLeftNavigationExpanded } from "~/features/layout/left-navigation/hooks/useLeftNavigationExpanded";
import { useLeftNavigationHoverState } from "~/features/layout/left-navigation/hooks/useLeftNavigationHoverState";
import { LeftNavigationHoverProvider } from "~/features/layout/left-navigation/components/LeftNavigationHoverProvider";
import { SidebarBrand } from "~/features/layout/left-navigation/header-logo/SidebarBrand";

function LeftNavigationContent() {
  const { isOpen } = useNavState();
  const isExpanded = useLeftNavigationExpanded();
  const { setHovering } = useLeftNavigationHoverState();

  useEffect(() => {
    return () => {
      setHovering(false);
    };
  }, [setHovering]);

  return (
    <div
      className={cn(
        "relative z-99 overflow-visible transition-[width] duration-200 ease-in-out",
        isOpen ? "left-navigation-open-width" : "left-navigation-close-width"
      )}
    >
      <div
        className={cn(
          "left-navigation-expandable absolute z-99 flex h-full flex-col border-r bg-(--surface-overlay) backdrop-blur-xl transition-[width] duration-200 ease-in-out",
          "border-(--border-1)",
          isExpanded
            ? "left-navigation-open-width"
            : "left-navigation-close-width"
        )}
      >
        <div
          className="sidebar-hover-area contents"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <SidebarBrand />
          <AppSidebar />
        </div>
        <BottomBtn />
      </div>
    </div>
  );
}

export function LeftNavigationShell() {
  return (
    <LeftNavigationHoverProvider>
      <LeftNavigationContent />
    </LeftNavigationHoverProvider>
  );
}

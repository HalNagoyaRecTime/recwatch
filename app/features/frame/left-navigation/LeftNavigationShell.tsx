import { useEffect } from "react";

import { useNavState } from "~/hooks/useNavState";
import { cn } from "~/lib/cn";

import { BottomBtn } from "~/features/frame/left-navigation/bottom-area/BottomBtn";
import { AppSidebar } from "~/features/frame/left-navigation/components/AppSidebar";
import { useLeftNavigationExpanded } from "~/features/frame/left-navigation/hooks/useLeftNavigationExpanded";
import { useLeftNavigationHoverState } from "~/features/frame/left-navigation/hooks/useLeftNavigationHoverState";
import { SidebarBrand } from "~/features/frame/left-navigation/header-logo/SidebarBrand";

export function LeftNavigationShell() {
  const isOpen = useNavState((state) => state.isOpen);
  const isExpanded = useLeftNavigationExpanded();
  const setHovering = useLeftNavigationHoverState((state) => state.setHovering);

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

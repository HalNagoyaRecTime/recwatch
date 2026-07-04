import { useEffect } from "react";

import { useNavState } from "~/hooks/useNavState";

import { BottomBtn } from "~/features/frame/left-navigation/bottom-area/BottomBtn";
import { AppSidebar } from "~/features/frame/left-navigation/components/AppSidebar";
import { useLeftNavigationExpanded } from "~/features/frame/left-navigation/hooks/useLeftNavigationExpanded";
import { useLeftNavigationHoverState } from "~/features/frame/left-navigation/hooks/useLeftNavigationHoverState";
import { LeftNavigationHoverProvider } from "~/features/frame/left-navigation/components/LeftNavigationHoverProvider";
import { SidebarBrand } from "~/features/frame/left-navigation/header-logo/SidebarBrand";
import {
  sidebarContainerStyle,
  sidebarPlaceholderStyle,
} from "~/features/frame/left-navigation/styles/sidebar-styles";

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
    <div className={sidebarPlaceholderStyle({ isOpen })}>
      <div className={sidebarContainerStyle({ isExpanded })}>
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

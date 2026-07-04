import { useEffect } from "react";

import { useNavState } from "~/hooks/useNavState";

import { BottomBtn } from "~/features/frame/navigation/bottom-area/BottomBtn";
import { AppSidebar } from "~/features/frame/navigation/components/AppSidebar";
import {
  NavigationUIProvider,
  useNavigationUI,
} from "~/features/frame/navigation/hooks/useNavigationUI";
import { SidebarBrand } from "~/features/frame/navigation/header-logo/SidebarBrand";
import {
  sidebarContainerStyle,
  sidebarPlaceholderStyle,
} from "~/features/frame/navigation/styles/sidebar-styles";

function NavigationContent() {
  const { isOpen } = useNavState();
  const { isExpanded, setHovering } = useNavigationUI();

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

export function NavigationShell() {
  return (
    <NavigationUIProvider>
      <NavigationContent />
    </NavigationUIProvider>
  );
}

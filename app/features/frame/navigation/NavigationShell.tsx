import { useEffect } from "react";

import { useNavState } from "~/hooks/useNavState";

import { SidebarFooter } from "~/features/frame/navigation/components/SidebarFooter";
import { AppSidebar } from "~/features/frame/navigation/components/AppSidebar";
import {
  NavigationUIProvider,
  useNavigationUI,
} from "~/features/frame/navigation/hooks/useNavigationUI";
import { SidebarHeader } from "~/features/frame/navigation/components/SidebarHeader";
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
          className="sidebar-hover-area flex flex-1 flex-col overflow-hidden"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <SidebarHeader />
          <AppSidebar />
        </div>
        <SidebarFooter />
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

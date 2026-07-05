import { useEffect } from "react";

import { useSidebarState } from "~/hooks/useSidebarState";

import { SidebarFooter } from "~/features/frame/sidebar/components/SidebarFooter";
import { AppSidebar } from "~/features/frame/sidebar/components/AppSidebar";
import {
  SidebarUIProvider,
  useSidebarUI,
} from "~/features/frame/sidebar/hooks/useSidebarUI";
import { SidebarHeader } from "~/features/frame/sidebar/components/SidebarHeader";
import {
  sidebarContainerStyle,
  sidebarPlaceholderStyle,
} from "~/features/frame/sidebar/styles/sidebar-styles";

function SidebarContent() {
  const { isOpen } = useSidebarState();
  const { isExpanded, setHovering } = useSidebarUI();

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

export function SidebarShell() {
  return (
    <SidebarUIProvider>
      <SidebarContent />
    </SidebarUIProvider>
  );
}

import { useEffect } from "react";

import { useSidebarState } from "~/hooks/useSidebarState";
import { cn } from "~/lib/cn";

import { SidebarFooter } from "~/features/frame/sidebar/components/SidebarFooter";
import { AppSidebar } from "~/features/frame/sidebar/components/AppSidebar";
import { SidebarUIProvider } from "~/features/frame/sidebar/components/SidebarUIProvider";
import { useSidebarUI } from "~/features/frame/sidebar/hooks/useSidebarUI";
import { SidebarHeader } from "~/features/frame/sidebar/components/SidebarHeader";
import {
  sidebarContainerStyle,
  sidebarPlaceholderStyle,
} from "~/features/frame/sidebar/styles/sidebar-styles";

function SidebarContent() {
  const { isMobile, isOpen, closeForMobile } = useSidebarState();
  const { isExpanded, setHovering } = useSidebarUI();

  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeForMobile();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeForMobile, isMobile, isOpen]);

  useEffect(() => {
    return () => {
      setHovering(false);
    };
  }, [setHovering]);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/25 transition-opacity md:hidden",
          isMobile && isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={closeForMobile}
      />

      <div className={cn(sidebarPlaceholderStyle({ isOpen }), "max-md:w-0")}>
        <div
          id="app-sidebar"
          className={cn(
            sidebarContainerStyle({ isExpanded }),
            "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-100 max-md:w-72 max-md:transition-transform",
            isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          )}
        >
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
    </>
  );
}

export function SidebarShell() {
  return (
    <SidebarUIProvider>
      <SidebarContent />
    </SidebarUIProvider>
  );
}

import { useEffect, useRef } from "react";

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
  const { mobileOpen, sidebarPinnedOpen, closeForMobile, pinOpen } =
    useSidebarState();
  const { isExpanded, setHovering } = useSidebarUI();
  const lastPointerTypeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeForMobile();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeForMobile]);

  useEffect(() => {
    return () => {
      setHovering(false);
    };
  }, [setHovering]);

  return (
    <>
      <button
        type="button"
        aria-label="サイドメニューを閉じる"
        onClick={closeForMobile}
        className={cn(
          "fixed inset-0 z-90 bg-black/30 transition-opacity md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          sidebarPlaceholderStyle({ isOpen: sidebarPinnedOpen }),
          "sidebar-mobile-placeholder"
        )}
      >
        <div
          id="app-sidebar"
          className={cn(
            sidebarContainerStyle({ isExpanded }),
            "sidebar-mobile-container",
            mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
          )}
        >
          <div
            className="sidebar-hover-area flex flex-1 flex-col overflow-hidden"
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setHovering(true);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setHovering(false);
            }}
            onPointerDownCapture={(event) => {
              lastPointerTypeRef.current = event.pointerType;
            }}
            onClickCapture={(event) => {
              const pointerType = lastPointerTypeRef.current;
              lastPointerTypeRef.current = null;

              if (!isExpanded && pointerType && pointerType !== "mouse") {
                event.preventDefault();
                pinOpen();
              }
            }}
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

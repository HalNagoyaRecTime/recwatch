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
  sidebarMobileBackplateStyle,
  sidebarMobileContainerStyle,
  sidebarPlaceholderStyle,
} from "~/features/frame/sidebar/styles/sidebar-styles";

const MOBILE_SIDEBAR_ID = "app-sidebar-mobile";
const DESKTOP_SIDEBAR_MEDIA_QUERY = "(min-width: 48rem)";
const NON_MOUSE_CLICK_MAX_DELAY_MS = 1000;
const MOBILE_DRAWER_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function DesktopSidebarContent() {
  const { sidebarPinnedOpen, pinOpen } = useSidebarState();
  const { isExpanded, setHovering } = useSidebarUI();
  const lastPointerTypeRef = useRef<{
    type: string;
    timestamp: number;
  } | null>(null);

  return (
    <div className="hidden h-full shrink-0 md:block">
      <div className={sidebarPlaceholderStyle({ isOpen: sidebarPinnedOpen })}>
        <div
          id="app-sidebar-desktop"
          className={sidebarContainerStyle({ isExpanded })}
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
              lastPointerTypeRef.current = {
                type: event.pointerType,
                timestamp: Date.now(),
              };
            }}
            onPointerCancelCapture={() => {
              lastPointerTypeRef.current = null;
            }}
            onClickCapture={(event) => {
              const pointer = lastPointerTypeRef.current;
              lastPointerTypeRef.current = null;

              // タッチ/ペンはhoverで展開できないため、
              // 閉じている間の最初のタップは展開だけに使い、次のタップで対象を操作する。
              if (
                !isExpanded &&
                pointer &&
                Date.now() - pointer.timestamp < NON_MOUSE_CLICK_MAX_DELAY_MS &&
                pointer.type !== "mouse"
              ) {
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
    </div>
  );
}

function MobileSidebarContent() {
  const { mobileOpen, closeForMobile } = useSidebarState();
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const desktopMediaQuery = window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY);
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeForMobile();
    };

    if (desktopMediaQuery.matches) closeForMobile();
    desktopMediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      desktopMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, [closeForMobile]);

  useEffect(() => {
    if (!mobileOpen) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        document.getElementById("mobile-nav-trigger")?.focus();
      }
      return;
    }

    wasOpenRef.current = true;
    drawerRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeForMobile();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          MOBILE_DRAWER_FOCUSABLE_SELECTOR
        )
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      });

      if (focusableElements.length === 0) {
        event.preventDefault();
        drawerRef.current.focus();
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      const activeIndex = activeElement
        ? focusableElements.indexOf(activeElement)
        : -1;

      if (activeIndex === -1) {
        event.preventDefault();
        (event.shiftKey
          ? focusableElements[focusableElements.length - 1]
          : focusableElements[0]
        ).focus();
      } else if (event.shiftKey && activeIndex === 0) {
        event.preventDefault();
        focusableElements[focusableElements.length - 1].focus();
      } else if (
        !event.shiftKey &&
        activeIndex === focusableElements.length - 1
      ) {
        event.preventDefault();
        focusableElements[0].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeForMobile]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        id="mobile-nav-overlay"
        aria-label="サイドメニューを閉じる"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        disabled={!mobileOpen}
        onClick={closeForMobile}
        className={cn(
          "fixed inset-0 z-90 bg-black/30 transition-opacity duration-300",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      <div
        id="mobile-nav-backplate"
        aria-hidden="true"
        className={cn(
          sidebarMobileBackplateStyle,
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      />

      <div
        ref={drawerRef}
        id={MOBILE_SIDEBAR_ID}
        role="dialog"
        aria-label="サイドメニュー"
        aria-modal="true"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        tabIndex={-1}
        className={cn(
          sidebarMobileContainerStyle,
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarHeader onClose={closeForMobile} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AppSidebar />
        </div>
      </div>
    </div>
  );
}

export function SidebarShell() {
  return (
    <>
      <SidebarUIProvider>
        <DesktopSidebarContent />
      </SidebarUIProvider>
      <SidebarUIProvider forceExpanded>
        <MobileSidebarContent />
      </SidebarUIProvider>
    </>
  );
}

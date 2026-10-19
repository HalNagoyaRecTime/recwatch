import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TransitionEvent as ReactTransitionEvent } from "react";

import { useDocumentScrollLock } from "~/hooks/useDocumentScrollLock";
import { useSidebarState } from "~/hooks/useSidebarState";
import { cn } from "~/lib/cn";

import { SidebarFooter } from "~/features/frame/sidebar/components/SidebarFooter";
import { AppSidebar } from "~/features/frame/sidebar/components/AppSidebar";
import { SidebarUIProvider } from "~/features/frame/sidebar/components/SidebarUIProvider";
import { useSidebarUI } from "~/features/frame/sidebar/hooks/useSidebarUI";
import { SidebarHeader } from "~/features/frame/sidebar/components/SidebarHeader";
import {
  sidebarContainerStyle,
  sidebarMobileContainerStyle,
  sidebarMobileSurfaceStyle,
  sidebarPlaceholderStyle,
} from "~/features/frame/sidebar/styles/sidebar-styles";

const MOBILE_SIDEBAR_ID = "app-sidebar-mobile";
// translate-x-*の遷移対象はtransformではなくtranslate。取り違えると退出後にDrawerが残る。
const MOBILE_DRAWER_TRANSITION_PROPERTY = "translate";
const MOBILE_DRAWER_TRANSITION_DURATION_MS = 400;
const DESKTOP_SIDEBAR_MEDIA_QUERY = "(min-width: 48rem)";
const NON_MOUSE_CLICK_MAX_DELAY_MS = 1000;
const MOBILE_DRAWER_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isDrawerTranslateTransition(
  event: ReactTransitionEvent<HTMLDivElement>
) {
  // ReactのtransitioncancelはpropertyNameを転写しないため、nativeEventを参照する。
  return event.nativeEvent.propertyName === MOBILE_DRAWER_TRANSITION_PROPERTY;
}

type MobileSidebarDrawerProps = {
  mobileOpen: boolean;
  isActive: boolean;
  closeForMobile: () => void;
  onTransitionComplete: (event: ReactTransitionEvent<HTMLDivElement>) => void;
};

function MobileSidebarDrawer({
  mobileOpen,
  isActive,
  closeForMobile,
  onTransitionComplete,
}: MobileSidebarDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (mobileOpen) drawerRef.current?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

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
    <div
      ref={drawerRef}
      id={MOBILE_SIDEBAR_ID}
      role="dialog"
      aria-label="サイドメニュー"
      aria-modal="true"
      aria-hidden={!mobileOpen}
      inert={!mobileOpen}
      tabIndex={-1}
      onTransitionEnd={onTransitionComplete}
      onTransitionCancel={onTransitionComplete}
      className={cn(
        sidebarMobileContainerStyle,
        isActive ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div aria-hidden="true" className={sidebarMobileSurfaceStyle} />
      <div className="relative z-10 flex h-full w-full flex-col">
        <SidebarHeader onClose={closeForMobile} safeArea />
        <div className="sidebar-mobile-content-safe-area flex min-h-0 flex-1 flex-col overflow-hidden">
          <AppSidebar overscrollBehavior="none" />
        </div>
      </div>
    </div>
  );
}

function DesktopSidebarContent() {
  const { sidebarPinnedOpen, pinOpen } = useSidebarState();
  const { isExpanded, setHovering } = useSidebarUI();
  const lastPointerTypeRef = useRef<{
    type: string;
    timestamp: number;
  } | null>(null);

  return (
    <div className="hidden shrink-0 md:block">
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
  const [hasEntered, setHasEntered] = useState(false);
  const wasOpenedRef = useRef(false);
  const closeFallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const desktopMediaQuery = window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY);
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeForMobile();
        setHasEntered(false);
      }
    };

    if (desktopMediaQuery.matches) {
      closeForMobile();
    }
    desktopMediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      desktopMediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, [closeForMobile]);

  useEffect(() => {
    if (!mobileOpen || hasEntered) return;

    const frameId = window.requestAnimationFrame(() => {
      setHasEntered(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [mobileOpen, hasEntered]);

  const isActive = mobileOpen && hasEntered;
  const shouldRender = mobileOpen || hasEntered;

  useDocumentScrollLock(shouldRender, { mode: "document" });

  useEffect(() => {
    if (mobileOpen || !hasEntered) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion
      ? 0
      : MOBILE_DRAWER_TRANSITION_DURATION_MS;

    closeFallbackTimerRef.current = window.setTimeout(() => {
      closeFallbackTimerRef.current = null;
      setHasEntered(false);
    }, duration);

    return () => {
      if (closeFallbackTimerRef.current !== null) {
        window.clearTimeout(closeFallbackTimerRef.current);
        closeFallbackTimerRef.current = null;
      }
    };
  }, [mobileOpen, hasEntered]);

  useLayoutEffect(() => {
    if (mobileOpen) {
      wasOpenedRef.current = true;
      return;
    }

    if (!shouldRender && wasOpenedRef.current) {
      wasOpenedRef.current = false;
      document.getElementById("mobile-nav-trigger")?.focus();
    }
  }, [mobileOpen, shouldRender]);

  const completeDrawerClose = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || mobileOpen || !hasEntered) {
      return;
    }

    // 退出後の固定Drawerを残すとSafari下部UIの色残りにつながり得るため、DOMから外す。
    if (closeFallbackTimerRef.current !== null) {
      window.clearTimeout(closeFallbackTimerRef.current);
      closeFallbackTimerRef.current = null;
    }
    setHasEntered(false);
  };

  const handleDrawerTransitionComplete = (
    event: ReactTransitionEvent<HTMLDivElement>
  ) => {
    if (!isDrawerTranslateTransition(event)) return;
    completeDrawerClose(event);
  };

  return (
    <div className="md:hidden">
      {shouldRender ? (
        <>
          {/* クリック領域は全画面、暗転面だけ下safe-areaの手前で止める。 */}
          <button
            type="button"
            id="mobile-nav-overlay"
            aria-label="サイドメニューを閉じる"
            aria-hidden={!mobileOpen}
            tabIndex={mobileOpen ? 0 : -1}
            disabled={!mobileOpen}
            onClick={closeForMobile}
            className={cn(
              "fixed inset-0 z-90 bg-transparent",
              isActive ? "pointer-events-auto" : "pointer-events-none"
            )}
          >
            <span
              data-testid="mobile-nav-overlay-visual"
              aria-hidden="true"
              className={cn(
                "mobile-safe-area-visual pointer-events-none absolute inset-x-0 top-0 bg-black/30 transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
          <MobileSidebarDrawer
            mobileOpen={mobileOpen}
            isActive={isActive}
            closeForMobile={closeForMobile}
            onTransitionComplete={handleDrawerTransitionComplete}
          />
        </>
      ) : null}
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

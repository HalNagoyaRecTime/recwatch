import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  TransitionEvent as ReactTransitionEvent,
} from "react";

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
  sidebarMobileDialogStyle,
  sidebarPlaceholderStyle,
} from "~/features/frame/sidebar/styles/sidebar-styles";

const MOBILE_SIDEBAR_ID = "app-sidebar-mobile";
const DESKTOP_SIDEBAR_MEDIA_QUERY = "(min-width: 48rem)";
const NON_MOUSE_CLICK_MAX_DELAY_MS = 1000;
const MOBILE_DRAWER_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isOutsideDialog(
  dialog: HTMLDialogElement,
  clientX: number,
  clientY: number
) {
  const rect = dialog.getBoundingClientRect();
  return (
    clientX < rect.left ||
    clientX >= rect.right ||
    clientY < rect.top ||
    clientY >= rect.bottom
  );
}

type MobileSidebarDialogProps = {
  mobileOpen: boolean;
  isActive: boolean;
  closeForMobile: () => void;
  onTransitionEnd: (event: ReactTransitionEvent<HTMLDialogElement>) => void;
  onTransitionCancel: (event: ReactTransitionEvent<HTMLDialogElement>) => void;
};

function MobileSidebarDialog({
  mobileOpen,
  isActive,
  closeForMobile,
  onTransitionEnd,
  onTransitionCancel,
}: MobileSidebarDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropPointerDownRef = useRef(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();
    dialog.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        MOBILE_DRAWER_FOCUSABLE_SELECTOR
      )
    ).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    if (focusableElements.length === 0) {
      event.preventDefault();
      event.currentTarget.focus();
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

  const handlePointerDown = (event: ReactPointerEvent<HTMLDialogElement>) => {
    backdropPointerDownRef.current =
      event.button === 0 &&
      isOutsideDialog(event.currentTarget, event.clientX, event.clientY);
  };

  const handleClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    const startedOutside = backdropPointerDownRef.current;
    backdropPointerDownRef.current = false;

    if (
      startedOutside &&
      isOutsideDialog(event.currentTarget, event.clientX, event.clientY)
    ) {
      closeForMobile();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id={MOBILE_SIDEBAR_ID}
      aria-label="サイドメニュー"
      aria-hidden={!mobileOpen}
      inert={!mobileOpen}
      tabIndex={-1}
      data-active={isActive}
      onCancel={(event) => {
        event.preventDefault();
        closeForMobile();
      }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerCancel={() => {
        backdropPointerDownRef.current = false;
      }}
      onClick={handleClick}
      onTransitionEnd={onTransitionEnd}
      onTransitionCancel={onTransitionCancel}
      className={cn(
        sidebarMobileDialogStyle,
        isActive ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <SidebarHeader onClose={closeForMobile} safeArea />
      <div className="sidebar-mobile-content-safe-area flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppSidebar overscrollBehavior="none" />
      </div>
    </dialog>
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

  useDocumentScrollLock(mobileOpen, { mode: "body" });

  useEffect(() => {
    if (!mobileOpen || hasEntered) return;

    const frameId = window.requestAnimationFrame(() => {
      setHasEntered(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [mobileOpen, hasEntered]);

  const isActive = mobileOpen && hasEntered;
  const shouldRender = mobileOpen || hasEntered;

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

  const completeDrawerClose = (
    event: ReactTransitionEvent<HTMLDialogElement>
  ) => {
    if (event.target !== event.currentTarget || mobileOpen || !hasEntered) {
      return;
    }

    event.currentTarget.close();
    setHasEntered(false);
  };

  const handleDrawerTransitionEnd = (
    event: ReactTransitionEvent<HTMLDialogElement>
  ) => {
    if (event.propertyName !== "transform") return;
    completeDrawerClose(event);
  };

  const handleDrawerTransitionCancel = (
    event: ReactTransitionEvent<HTMLDialogElement>
  ) => {
    if (event.propertyName && event.propertyName !== "transform") return;
    completeDrawerClose(event);
  };

  return (
    <div className="md:hidden">
      {shouldRender ? (
        <MobileSidebarDialog
          mobileOpen={mobileOpen}
          isActive={isActive}
          closeForMobile={closeForMobile}
          onTransitionEnd={handleDrawerTransitionEnd}
          onTransitionCancel={handleDrawerTransitionCancel}
        />
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

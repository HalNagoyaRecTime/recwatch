import { readFileSync } from "node:fs";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarStateProvider } from "~/components/providers/SidebarStateProvider";
import { MobileHamburgerMenuBtn } from "~/features/frame/main-header/components/MobileHamburgerMenuBtn";
import { SidebarShell } from "~/features/frame/sidebar/SidebarShell";

const normalizedCss = readFileSync("app/app.css", "utf8").replace(/\s+/g, " ");

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderShell() {
  render(
    <MemoryRouter>
      <SidebarStateProvider>
        <MobileHamburgerMenuBtn />
        <SidebarShell />
        <LocationProbe />
      </SidebarStateProvider>
    </MemoryRouter>
  );
}

function getMobileDrawer() {
  const drawer = document.getElementById("app-sidebar-mobile");
  if (!(drawer instanceof HTMLDivElement)) {
    throw new Error("モバイル Sidebar Drawer が見つかりません");
  }
  return drawer;
}

function getMobileOverlay() {
  const overlay = document.getElementById("mobile-nav-overlay");
  if (!(overlay instanceof HTMLButtonElement)) {
    throw new Error("モバイル Sidebar Overlay が見つかりません");
  }
  return overlay;
}

function getDesktopSidebar() {
  const sidebar = document.getElementById("app-sidebar-desktop");
  if (!sidebar) throw new Error("Desktop Sidebar が見つかりません");
  return sidebar;
}

function getHamburger() {
  return screen.getByRole("button", { name: "Toggle navigation" });
}

function getDesktopFooterToggle() {
  return within(getDesktopSidebar()).getByRole("button", {
    name: "サイドバーの固定表示を切り替える",
  });
}

function tap(element: Element, pointerType: "touch" | "pen" | "mouse") {
  fireEvent.pointerDown(element, { pointerType });
  fireEvent.click(element);
}

let nextFrameId = 0;
const animationFrames = new Map<number, FrameRequestCallback>();

function flushAnimationFrames() {
  act(() => {
    const callbacks = Array.from(animationFrames.values());
    animationFrames.clear();
    callbacks.forEach((callback) => callback(0));
  });
}

function openMobileDrawer() {
  fireEvent.click(getHamburger());
  flushAnimationFrames();
}

function finishMobileClose() {
  const drawer = document.getElementById("app-sidebar-mobile");
  if (drawer) fireEvent.transitionEnd(drawer, { propertyName: "translate" });
}

beforeEach(() => {
  sessionStorage.clear();
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("overscroll-behavior");
  document.documentElement.style.removeProperty("overflow");
  document.documentElement.style.removeProperty("overscroll-behavior");
  animationFrames.clear();
  nextFrameId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    nextFrameId += 1;
    animationFrames.set(nextFrameId, callback);
    return nextFrameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (frameId: number) => {
    animationFrames.delete(frameId);
  });
});

afterEach(() => {
  cleanup();
  animationFrames.clear();
  vi.unstubAllGlobals();
});

describe("モバイル Drawer", () => {
  it("初期状態ではDrawerとOverlayを残さない", () => {
    renderShell();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
  });

  it("HamburgerでDrawerとOverlayを開き、Drawerへフォーカスを移す", () => {
    renderShell();

    openMobileDrawer();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "true");
    expect(getMobileDrawer()).toBeInstanceOf(HTMLDivElement);
    expect(getMobileDrawer()).toHaveAttribute("role", "dialog");
    expect(getMobileDrawer()).toHaveAttribute("aria-modal", "true");
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "false");
    expect(getMobileDrawer()).not.toHaveAttribute("inert");
    expect(getMobileDrawer().className).toContain("translate-x-0");
    expect(getMobileOverlay()).toBeInTheDocument();
    expect(document.activeElement).toBe(getMobileDrawer());
  });

  it("最初の表示フレーム前に閉じた場合はロックとDOMをすぐ解除する", () => {
    renderShell();

    fireEvent.click(getHamburger());
    expect(getMobileDrawer()).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(getHamburger());
  });

  it("Drawerを開いている間は背面をロックし、Drawer内はスクロール可能にする", () => {
    document.body.style.setProperty("overflow", "auto");
    document.body.style.setProperty("overscroll-behavior", "contain");
    document.documentElement.style.setProperty("overflow", "scroll");
    document.documentElement.style.setProperty(
      "overscroll-behavior",
      "contain"
    );
    renderShell();

    openMobileDrawer();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("none");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
    expect(getMobileDrawer().querySelector(".scrollbar-none")).toHaveClass(
      "overflow-y-auto",
      "overscroll-y-none"
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("none");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
    const drawer = getMobileDrawer();
    expect(drawer).toBeInTheDocument();
    expect(getMobileOverlay()).toBeInTheDocument();
    expect(drawer).toHaveClass("-translate-x-full");
    expect(drawer).toHaveAttribute("inert");

    fireEvent.transitionEnd(drawer, { propertyName: "transform" });
    expect(drawer).toBeInTheDocument();

    finishMobileClose();
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("contain");
  });

  it("DrawerとOverlayのvisualをbottom safe area手前まで描画する", () => {
    renderShell();

    openMobileDrawer();

    const drawer = getMobileDrawer();
    const overlay = getMobileOverlay();
    expect(drawer).toHaveClass(
      "sidebar-viewport-height",
      "fixed",
      "top-0",
      "z-99",
      "bg-transparent",
      "transition-[translate]",
      "translate-x-0"
    );
    expect(drawer).not.toHaveClass("h-screen");
    expect(drawer).not.toHaveClass("h-dvh");
    expect(drawer.querySelector(".mobile-safe-area-visual")).toHaveClass(
      "bg-surface-base",
      "border-r",
      "pointer-events-none"
    );
    expect(overlay).toHaveClass(
      "fixed",
      "inset-0",
      "z-90",
      "bg-transparent",
      "pointer-events-auto"
    );
    expect(screen.getByTestId("mobile-nav-overlay-visual")).toHaveClass(
      "mobile-safe-area-visual",
      "bg-black/30",
      "pointer-events-none",
      "opacity-100"
    );
    expect(normalizedCss).toContain(
      ".mobile-safe-area-visual { bottom: env(safe-area-inset-bottom, 0px); }"
    );
    expect(
      drawer.querySelector(".sidebar-mobile-content-safe-area")
    ).toBeInTheDocument();
    expect(normalizedCss).toContain(
      ".sidebar-mobile-content-safe-area { padding-right: env(safe-area-inset-right, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
    );
  });

  it("Sidebarの高さは100vhをfallbackにし、対応ブラウザでは100dvhを使う", () => {
    expect(normalizedCss).toContain(
      ".sidebar-viewport-height { height: 100vh; }"
    );
    expect(normalizedCss).toContain(
      "@supports (height: 100dvh) { .sidebar-viewport-height { height: 100dvh; } }"
    );
  });

  it("Mobile Sidebar headerはsafe area込みで52px + safe areaをborder込みで確保する", () => {
    expect(normalizedCss).toContain(
      ".main-header-safe-area { box-sizing: border-box; height: var(--main-header-total-height); padding-top: env(safe-area-inset-top, 0px); }"
    );
    expect(normalizedCss).toContain(
      ".sidebar-mobile-header-safe-area { box-sizing: border-box; height: var(--main-header-total-height);"
    );
  });

  it("translate transitioncancelでDrawerとOverlayをunmountする", () => {
    renderShell();
    openMobileDrawer();

    fireEvent.keyDown(document, { key: "Escape" });

    const drawer = getMobileDrawer();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(drawer).toBeInTheDocument();

    fireEvent.transitionEnd(drawer, { propertyName: "opacity" });
    expect(drawer).toBeInTheDocument();

    fireEvent.transitionCancel(drawer, { propertyName: "transform" });
    expect(drawer).toBeInTheDocument();

    fireEvent.transitionCancel(drawer, { propertyName: "translate" });

    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(getHamburger());
  });

  it("reduced motionでtransition eventがなくても退出後にlockを解除する", () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(
        (query: string) =>
          ({
            matches: query === "(prefers-reduced-motion: reduce)",
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as MediaQueryList
      )
    );

    try {
      renderShell();
      openMobileDrawer();
      fireEvent.keyDown(document, { key: "Escape" });

      act(() => vi.runOnlyPendingTimers());

      expect(
        document.getElementById("app-sidebar-mobile")
      ).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe("");
      expect(document.documentElement.style.overflow).toBe("");
      expect(document.activeElement).toBe(getHamburger());
    } finally {
      vi.useRealTimers();
    }
  });

  it("Escapeで閉じ、exit transition後にHamburgerへfocusを戻す", () => {
    renderShell();

    openMobileDrawer();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "true");
    expect(getMobileDrawer()).toHaveAttribute("inert");
    expect(getMobileOverlay()).toBeDisabled();
    expect(document.activeElement).not.toBe(getHamburger());
    finishMobileClose();

    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(getHamburger());
  });

  it("Overlay clickで閉じ、visualをfade outしてからunmountする", () => {
    renderShell();

    openMobileDrawer();
    const drawer = getMobileDrawer();
    const overlay = getMobileOverlay();

    fireEvent.click(drawer);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(overlay);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(drawer).toBeInTheDocument();
    expect(overlay).toBeDisabled();
    expect(overlay).toHaveClass("pointer-events-none");
    expect(screen.getByTestId("mobile-nav-overlay-visual")).toHaveClass(
      "opacity-0"
    );
    finishMobileClose();
    expect(drawer).not.toBeInTheDocument();
    expect(overlay).not.toBeInTheDocument();
    expect(document.activeElement).toBe(getHamburger());
  });

  it("繰り返し開閉してもDrawerとOverlayを残さずスクロールを復帰する", () => {
    renderShell();

    openMobileDrawer();
    const firstDrawer = getMobileDrawer();
    fireEvent.click(getMobileOverlay());
    finishMobileClose();
    expect(firstDrawer).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");

    openMobileDrawer();
    const secondDrawer = getMobileDrawer();
    expect(secondDrawer).not.toBe(firstDrawer);
    expect(secondDrawer).toHaveClass("translate-x-0");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    finishMobileClose();
    expect(secondDrawer).not.toBeInTheDocument();
    expect(document.getElementById("mobile-nav-overlay")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(getHamburger());
  });

  it("Header closeは同じexit lifecycleを通ってHamburgerへfocusを戻す", () => {
    renderShell();

    openMobileDrawer();
    const drawer = getMobileDrawer();
    const mobileCloseButton = within(drawer).getByRole("button", {
      name: "サイドメニューを閉じる",
    });
    fireEvent.click(mobileCloseButton);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(drawer).toBeInTheDocument();
    finishMobileClose();
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(getHamburger());
  });

  it("Footerを表示せず、Headerに閉じるボタンを表示する", () => {
    renderShell();
    openMobileDrawer();
    const drawer = getMobileDrawer();

    expect(
      drawer.querySelector(".sidebar-mobile-header-safe-area")
    ).toHaveClass("border-b");
    expect(drawer.querySelector(".main-footer-height")).not.toBeInTheDocument();
    expect(
      within(drawer).getByRole("button", { name: "サイドメニューを閉じる" })
    ).toBeInTheDocument();
  });

  it("開いた Drawer 内でNavigation選択後に同じclose lifecycleを通る", () => {
    renderShell();

    openMobileDrawer();
    const drawer = getMobileDrawer();
    fireEvent.click(
      within(drawer).getByRole("link", { name: "ダッシュボード" })
    );

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(drawer).toBeInTheDocument();
    finishMobileClose();
    expect(drawer).not.toBeInTheDocument();
    expect(document.activeElement).toBe(getHamburger());
  });

  it("Drawer内のTab移動をループさせる", () => {
    renderShell();
    openMobileDrawer();

    const drawer = getMobileDrawer();
    const focusables = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];

    lastFocusable.focus();
    fireEvent.keyDown(lastFocusable, { key: "Tab" });
    expect(document.activeElement).toBe(firstFocusable);

    firstFocusable.focus();
    fireEvent.keyDown(firstFocusable, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastFocusable);
  });

  it("PC幅へ切り替わった場合は閉じる", () => {
    let handleChange: ((event: MediaQueryListEvent) => void) | undefined;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(
        () =>
          ({
            matches: false,
            media: "(min-width: 48rem)",
            onchange: null,
            addEventListener: (
              type: string,
              listener: (event: MediaQueryListEvent) => void
            ) => {
              if (type === "change") handleChange = listener;
            },
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as MediaQueryList
      )
    );
    renderShell();
    openMobileDrawer();

    act(() => {
      handleChange?.({ matches: true } as MediaQueryListEvent);
    });

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
});

describe("Desktop / Tablet Sidebar", () => {
  it("通常幅の高さいっぱいに表示される", () => {
    renderShell();

    expect(getDesktopSidebar().parentElement).toHaveClass(
      "sidebar-viewport-height",
      "sticky"
    );
    expect(getDesktopSidebar().parentElement).not.toHaveClass("h-screen");
    expect(getDesktopSidebar().parentElement).not.toHaveClass("h-dvh");
    expect(
      getDesktopSidebar().querySelector(".main-header-height")
    ).toHaveClass("border-b");
    expect(getDesktopSidebar().querySelector(".scrollbar-none")).toHaveClass(
      "overflow-y-auto",
      "overscroll-y-contain"
    );
  });

  it("Mouse hoverで一時展開し、leaveで戻る", () => {
    renderShell();
    const sidebar = getDesktopSidebar();
    const hoverArea = sidebar.querySelector(".sidebar-hover-area");
    if (!hoverArea) throw new Error("hover area が見つかりません");

    fireEvent.click(getDesktopFooterToggle());
    fireEvent.pointerEnter(hoverArea, { pointerType: "mouse" });
    expect(sidebar.className).toContain("sidebar-open-width");
    fireEvent.pointerLeave(hoverArea, { pointerType: "mouse" });
    expect(sidebar.className).toContain("sidebar-close-width");
  });

  it("Touch / Pen の hover では展開しない", () => {
    renderShell();
    const sidebar = getDesktopSidebar();
    const hoverArea = sidebar.querySelector(".sidebar-hover-area");
    if (!hoverArea) throw new Error("hover area が見つかりません");

    fireEvent.click(getDesktopFooterToggle());
    fireEvent.pointerEnter(hoverArea, { pointerType: "touch" });
    fireEvent.pointerEnter(hoverArea, { pointerType: "pen" });

    expect(sidebar.className).toContain("sidebar-close-width");
  });

  it("Touch / Pen の最初のタップでは遷移せず展開する", () => {
    renderShell();
    const sidebar = getDesktopSidebar();
    const dashboardLink = within(sidebar).getByRole("link", {
      name: "ダッシュボード",
    });

    fireEvent.click(getDesktopFooterToggle());
    tap(dashboardLink, "touch");

    expect(sidebar.className).toContain("sidebar-open-width");
    expect(screen.getByTestId("location")).toHaveTextContent("/");

    tap(dashboardLink, "pen");
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
  });

  it("Mobile Drawer の開閉で Desktop の固定状態を変更しない", () => {
    renderShell();
    const desktopSidebar = getDesktopSidebar();

    fireEvent.click(getDesktopFooterToggle());
    expect(desktopSidebar.className).toContain("sidebar-close-width");

    openMobileDrawer();
    expect(desktopSidebar.className).toContain("sidebar-close-width");
    fireEvent.click(getHamburger());
    expect(desktopSidebar.className).toContain("sidebar-close-width");
  });
});

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarStateProvider } from "~/components/providers/SidebarStateProvider";
import { MobileHamburgerMenuBtn } from "~/features/frame/main-header/components/MobileHamburgerMenuBtn";
import { SidebarShell } from "~/features/frame/sidebar/SidebarShell";

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
  if (!drawer) throw new Error("モバイル Sidebar が見つかりません");
  return drawer;
}

function getDesktopSidebar() {
  const sidebar = document.getElementById("app-sidebar-desktop");
  if (!sidebar) throw new Error("Desktop Sidebar が見つかりません");
  return sidebar;
}

function getHamburger() {
  return screen.getByRole("button", { name: "Toggle navigation" });
}

function getMobileOverlay() {
  const overlay = document.getElementById("mobile-nav-overlay");
  if (!overlay) throw new Error("モバイル Overlay が見つかりません");
  return overlay;
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
  if (drawer) fireEvent.transitionEnd(drawer, { propertyName: "transform" });
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
  animationFrames.clear();
  vi.unstubAllGlobals();
});

describe("モバイル Drawer", () => {
  it("初期状態では閉じた固定UIをDOMに残さない", () => {
    renderShell();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-backplate")
    ).not.toBeInTheDocument();
  });

  it("Hamburgerで開き、Drawerへフォーカスを移す", () => {
    renderShell();

    openMobileDrawer();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "true");
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "false");
    expect(getMobileDrawer()).not.toHaveAttribute("inert");
    expect(getMobileDrawer()).toHaveAttribute("aria-modal", "true");
    expect(getMobileDrawer().className).toContain("translate-x-0");
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
  });

  it("Drawerを開いている間は背面をロックし、Drawer内はスクロール可能にする", () => {
    document.body.style.setProperty("overflow", "auto");
    document.body.style.setProperty("overscroll-behavior", "contain");
    document.documentElement.style.setProperty("overflow", "scroll");
    document.documentElement.style.setProperty("overscroll-behavior", "none");
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

    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
    const drawer = getMobileDrawer();
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass("-translate-x-full");
    expect(document.getElementById("mobile-nav-overlay")).toBeInTheDocument();
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
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
  });

  it("Mobile Drawerのfixed rootを透明にし、内側のsurfaceで背景を表示する", () => {
    renderShell();

    expect(document.getElementById("mobile-nav-backplate")).toBeNull();

    openMobileDrawer();

    const drawer = getMobileDrawer();
    const surface = drawer.querySelector(".sidebar-mobile-surface");

    expect(drawer).toHaveClass(
      "fixed",
      "z-99",
      "bg-transparent",
      "translate-x-0"
    );
    expect(drawer).not.toHaveClass("bg-surface-base");
    expect(surface).toHaveClass(
      "pointer-events-none",
      "absolute",
      "inset-0",
      "border-r",
      "border-border-subtle",
      "bg-surface-base",
      "backdrop-blur-xl"
    );
    expect(
      document.getElementById("mobile-nav-backplate")
    ).not.toBeInTheDocument();
  });

  it("transform transitioncancelでもclose後のDrawerをunmountする", () => {
    renderShell();
    openMobileDrawer();

    fireEvent.keyDown(document, { key: "Escape" });

    const drawer = getMobileDrawer();
    expect(document.body.style.overflow).toBe("");
    expect(drawer).toBeInTheDocument();

    fireEvent.transitionCancel(drawer, { propertyName: "transform" });

    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
  });

  it("Overlay、Escape、Headerで閉じ、閉じた後はHamburgerへ戻る", () => {
    renderShell();

    openMobileDrawer();
    const overlay = getMobileOverlay();
    const visualOverlay = screen.getByTestId("mobile-nav-overlay-visual");
    expect(overlay).toHaveClass("fixed", "inset-0", "bg-transparent");
    expect(overlay).not.toHaveClass("bg-black/30");
    expect(visualOverlay).toHaveClass(
      "pointer-events-none",
      "absolute",
      "inset-0",
      "bg-black/30",
      "opacity-100"
    );

    fireEvent.click(visualOverlay);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(getHamburger());
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toBeInTheDocument();
    expect(visualOverlay).toHaveClass("opacity-0");
    finishMobileClose();

    openMobileDrawer();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    finishMobileClose();

    openMobileDrawer();
    const mobileCloseButton = within(getMobileDrawer()).getByRole("button", {
      name: "サイドメニューを閉じる",
    });
    fireEvent.click(mobileCloseButton);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    finishMobileClose();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-backplate")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
  });

  it("Footerを表示せず、Headerに閉じるボタンを表示する", () => {
    renderShell();
    openMobileDrawer();
    const drawer = getMobileDrawer();

    expect(drawer.querySelector(".main-footer-height")).not.toBeInTheDocument();
    expect(
      within(drawer).getByRole("button", { name: "サイドメニューを閉じる" })
    ).toBeInTheDocument();
  });

  it("開いた Drawer 内でNavigation選択後に閉じる", () => {
    renderShell();

    openMobileDrawer();
    fireEvent.click(
      within(getMobileDrawer()).getByRole("link", { name: "ダッシュボード" })
    );

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    finishMobileClose();
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
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(firstFocusable);

    firstFocusable.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
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
    expect(document.body.style.overflow).toBe("");
  });
});

describe("Desktop / Tablet Sidebar", () => {
  it("通常幅の高さいっぱいに表示される", () => {
    renderShell();

    expect(getDesktopSidebar().parentElement).toHaveClass("h-dvh", "sticky");
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

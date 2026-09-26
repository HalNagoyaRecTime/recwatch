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
  if (!(drawer instanceof HTMLDialogElement)) {
    throw new Error("モバイル Sidebar dialog が見つかりません");
  }
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

function cancelMobileDialog() {
  const event = new Event("cancel", { bubbles: true, cancelable: true });
  act(() => {
    getMobileDrawer().dispatchEvent(event);
  });
  return event;
}

let originalShowModalDescriptor: PropertyDescriptor | undefined;
let originalCloseDescriptor: PropertyDescriptor | undefined;
let showModalMock: ReturnType<typeof vi.fn>;
let closeMock: ReturnType<typeof vi.fn>;

function installDialogMethodStubs() {
  const prototype = HTMLDialogElement.prototype;
  originalShowModalDescriptor = Object.getOwnPropertyDescriptor(
    prototype,
    "showModal"
  );
  originalCloseDescriptor = Object.getOwnPropertyDescriptor(prototype, "close");

  showModalMock = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  closeMock = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });

  Object.defineProperty(prototype, "showModal", {
    configurable: true,
    value: showModalMock,
  });
  Object.defineProperty(prototype, "close", {
    configurable: true,
    value: closeMock,
  });
}

function restoreDialogMethodStubs() {
  const prototype = HTMLDialogElement.prototype;
  if (originalShowModalDescriptor) {
    Object.defineProperty(prototype, "showModal", originalShowModalDescriptor);
  } else {
    Reflect.deleteProperty(prototype, "showModal");
  }
  if (originalCloseDescriptor) {
    Object.defineProperty(prototype, "close", originalCloseDescriptor);
  } else {
    Reflect.deleteProperty(prototype, "close");
  }
}

beforeEach(() => {
  sessionStorage.clear();
  installDialogMethodStubs();
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
  restoreDialogMethodStubs();
});

describe("モバイル Drawer", () => {
  it("初期状態では閉じたdialogや通常DOM overlayを残さない", () => {
    renderShell();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("mobile-nav-overlay-visual")).toBeNull();
    expect(
      document.getElementById("mobile-nav-backplate")
    ).not.toBeInTheDocument();
  });

  it("Hamburgerでnative modal dialogを開き、dialogへフォーカスを移す", () => {
    renderShell();

    openMobileDrawer();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "true");
    expect(getMobileDrawer()).toBeInstanceOf(HTMLDialogElement);
    expect(getMobileDrawer().open).toBe(true);
    expect(showModalMock).toHaveBeenCalledTimes(1);
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "false");
    expect(getMobileDrawer()).not.toHaveAttribute("inert");
    expect(getMobileDrawer()).not.toHaveAttribute("aria-modal");
    expect(getMobileDrawer().className).toContain("translate-x-0");
    expect(getMobileDrawer()).toHaveAttribute("data-active", "true");
    expect(document.activeElement).toBe(getMobileDrawer());
  });

  it("最初の表示フレーム前に閉じた場合はロックとDOMをすぐ解除する", () => {
    renderShell();

    fireEvent.click(getHamburger());
    expect(getMobileDrawer()).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    cancelMobileDialog();

    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(
      document.getElementById("mobile-nav-overlay")
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(closeMock).toHaveBeenCalledTimes(1);
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
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("contain");
    expect(getMobileDrawer().querySelector(".scrollbar-none")).toHaveClass(
      "overflow-y-auto",
      "overscroll-y-none"
    );

    cancelMobileDialog();

    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("contain");
    const drawer = getMobileDrawer();
    expect(drawer).toBeInTheDocument();
    expect(drawer.open).toBe(true);
    expect(drawer).toHaveClass("-translate-x-full");
    expect(drawer).toHaveAttribute("inert");
    expect(closeMock).not.toHaveBeenCalled();
    finishMobileClose();
    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(drawer.open).toBe(false);
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.overscrollBehavior).toBe("contain");
    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.documentElement.style.overscrollBehavior).toBe("contain");
  });

  it("dialog本体をsurfaceにしてbackdropだけで暗転し、content safe areaを維持する", () => {
    renderShell();

    expect(document.getElementById("mobile-nav-backplate")).toBeNull();

    openMobileDrawer();

    const drawer = getMobileDrawer();
    expect(document.getElementById("mobile-nav-overlay")).toBeNull();
    expect(screen.queryByTestId("mobile-nav-overlay-visual")).toBeNull();
    expect(drawer).toHaveClass(
      "mobile-sidebar-dialog",
      "fixed",
      "z-99",
      "bg-surface-base",
      "border-r",
      "border-border-subtle",
      "h-dvh",
      "translate-x-0"
    );
    expect(drawer.querySelector(".sidebar-mobile-surface")).toBeNull();
    expect(drawer.querySelector(".mobile-safe-area-visual")).toBeNull();
    expect(normalizedCss).not.toContain(".mobile-safe-area-visual");
    expect(normalizedCss).toContain(
      ".mobile-sidebar-dialog::backdrop { background: rgb(0 0 0 / 30%); opacity: 0; transition: opacity 300ms; }"
    );
    expect(normalizedCss).toContain(
      '.mobile-sidebar-dialog[data-active="true"]::backdrop { opacity: 1; }'
    );
    expect(
      drawer.querySelector(".sidebar-mobile-content-safe-area")
    ).toBeInTheDocument();
    expect(normalizedCss).toContain(
      ".sidebar-mobile-content-safe-area { padding-right: env(safe-area-inset-right, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
    );
    expect(
      document.getElementById("mobile-nav-backplate")
    ).not.toBeInTheDocument();
  });

  it("Mobile Sidebar headerはsafe area込みで52px + safe areaをborder込みで確保する", () => {
    expect(normalizedCss).toContain(
      ".sidebar-mobile-header-safe-area { box-sizing: border-box; height: calc(var(--main-header-height) + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px);"
    );
    expect(normalizedCss).not.toContain(
      ".sidebar-mobile-header-safe-area { box-sizing: content-box;"
    );
  });

  it("transform transitioncancelでdialogをcloseしてunmountする", () => {
    renderShell();
    openMobileDrawer();

    cancelMobileDialog();

    const drawer = getMobileDrawer();
    expect(document.body.style.overflow).toBe("");
    expect(drawer).toBeInTheDocument();
    expect(drawer.open).toBe(true);

    fireEvent.transitionEnd(drawer, { propertyName: "opacity" });
    expect(drawer.open).toBe(true);

    fireEvent.transitionCancel(drawer, { propertyName: "transform" });

    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(drawer.open).toBe(false);
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(getHamburger());
  });

  it("native cancel eventをpreventしてexit transition後にcloseする", () => {
    renderShell();

    openMobileDrawer();
    const cancelEvent = cancelMobileDialog();

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "true");
    expect(getMobileDrawer().open).toBe(true);
    expect(document.activeElement).not.toBe(getHamburger());
    expect(closeMock).not.toHaveBeenCalled();
    finishMobileClose();

    expect(
      document.getElementById("app-sidebar-mobile")
    ).not.toBeInTheDocument();
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(getHamburger());
  });

  it("backdropはdialog矩形外でdownして外でclickした場合だけ閉じる", () => {
    renderShell();

    openMobileDrawer();
    const drawer = getMobileDrawer();
    vi.spyOn(drawer, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 288,
      bottom: 844,
      width: 288,
      height: 844,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(drawer, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.click(drawer, { clientX: 100, clientY: 100 });
    expect(drawer.open).toBe(true);

    fireEvent.pointerDown(drawer, { button: 0, clientX: 400, clientY: 100 });
    fireEvent.click(drawer, { clientX: 100, clientY: 100 });
    expect(drawer.open).toBe(true);

    fireEvent.pointerDown(drawer, { button: 0, clientX: 400, clientY: 100 });
    fireEvent.click(drawer, { clientX: 400, clientY: 100 });
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(drawer.open).toBe(true);
    expect(closeMock).not.toHaveBeenCalled();
    finishMobileClose();
    expect(drawer.open).toBe(false);
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
    expect(drawer.open).toBe(true);
    expect(closeMock).not.toHaveBeenCalled();
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

    expect(drawer.querySelector(".main-header-height")).toHaveClass("border-b");
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
    expect(drawer.open).toBe(true);
    finishMobileClose();
    expect(drawer.open).toBe(false);
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
    expect(showModalMock).toHaveBeenCalledTimes(1);
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(document.body.style.overflow).toBe("");
  });
});

describe("Desktop / Tablet Sidebar", () => {
  it("通常幅の高さいっぱいに表示される", () => {
    renderShell();

    expect(getDesktopSidebar().parentElement).toHaveClass("h-dvh", "sticky");
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

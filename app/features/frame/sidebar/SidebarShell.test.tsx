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

function getMobileBackplate() {
  const backplate = document.getElementById("mobile-nav-backplate");
  if (!backplate) throw new Error("モバイル Backplate が見つかりません");
  return backplate;
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

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("モバイル Drawer", () => {
  it("初期状態では閉じており、閉じた中身が操作対象にならない", () => {
    renderShell();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "true");
    expect(getMobileDrawer()).toHaveAttribute("inert", "");
    expect(getMobileOverlay()).toBeDisabled();
    expect(getMobileOverlay()).toHaveAttribute("tabindex", "-1");
  });

  it("Hamburgerで開き、Drawerへフォーカスを移す", () => {
    renderShell();

    fireEvent.click(getHamburger());

    expect(getHamburger()).toHaveAttribute("aria-expanded", "true");
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "false");
    expect(getMobileDrawer()).not.toHaveAttribute("inert");
    expect(getMobileDrawer()).toHaveAttribute("aria-modal", "true");
    expect(getMobileDrawer().className).toContain("translate-x-0");
    expect(getMobileBackplate().className).toContain("translate-x-0");
    expect(document.activeElement).toBe(getMobileDrawer());
  });

  it("開いている間だけDrawerの直後ろにテーマ背景を表示する", () => {
    renderShell();

    expect(getMobileBackplate()).toHaveAttribute("aria-hidden", "true");
    expect(getMobileBackplate()).toHaveClass(
      "bg-surface-base",
      "z-98",
      "-translate-x-full"
    );

    fireEvent.click(getHamburger());

    expect(getMobileBackplate()).toHaveClass("translate-x-0");
    expect(getMobileDrawer()).toHaveClass("z-99", "translate-x-0");
  });

  it("Overlay、Escape、Headerで閉じ、閉じた後はHamburgerへ戻る", () => {
    renderShell();

    fireEvent.click(getHamburger());
    fireEvent.click(getMobileOverlay());
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(getHamburger());

    fireEvent.click(getHamburger());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(getHamburger());
    const mobileCloseButton = within(getMobileDrawer()).getByRole("button", {
      name: "サイドメニューを閉じる",
    });
    fireEvent.click(mobileCloseButton);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
  });

  it("Footerを表示せず、Headerに閉じるボタンを表示する", () => {
    renderShell();
    fireEvent.click(getHamburger());
    const drawer = getMobileDrawer();

    expect(drawer.querySelector(".main-footer-height")).not.toBeInTheDocument();
    expect(
      within(drawer).getByRole("button", { name: "サイドメニューを閉じる" })
    ).toBeInTheDocument();
  });

  it("開いた Drawer 内でNavigation選択後に閉じる", () => {
    renderShell();

    fireEvent.click(getHamburger());
    fireEvent.click(
      within(getMobileDrawer()).getByRole("link", { name: "ダッシュボード" })
    );

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
  });

  it("Drawer内のTab移動をループさせる", () => {
    renderShell();
    fireEvent.click(getHamburger());

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
    fireEvent.click(getHamburger());

    act(() => {
      handleChange?.({ matches: true } as MediaQueryListEvent);
    });

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(getMobileDrawer()).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Desktop / Tablet Sidebar", () => {
  it("通常幅の高さいっぱいに表示される", () => {
    renderShell();

    expect(getDesktopSidebar().parentElement).toHaveClass("h-full");
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

    fireEvent.click(getHamburger());
    expect(desktopSidebar.className).toContain("sidebar-close-width");
    fireEvent.click(getHamburger());
    expect(desktopSidebar.className).toContain("sidebar-close-width");
  });
});

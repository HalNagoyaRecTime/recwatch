import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

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

beforeEach(() => {
  sessionStorage.clear();
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
    expect(document.activeElement).toBe(getMobileDrawer());
  });

  it("Overlay、Escape、Footerで閉じ、閉じた後はHamburgerへ戻る", () => {
    renderShell();

    fireEvent.click(getHamburger());
    fireEvent.click(getMobileOverlay());
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(getHamburger());

    fireEvent.click(getHamburger());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(getHamburger());
    const mobileFooter = within(getMobileDrawer()).getByRole("button", {
      name: "サイドメニューを閉じる",
    });
    fireEvent.click(mobileFooter);
    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
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
});

describe("Desktop / Tablet Sidebar", () => {
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

import { fireEvent, render, screen } from "@testing-library/react";
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

function getSidebarContainer() {
  const el = document.getElementById("app-sidebar");
  if (!el) throw new Error("app-sidebar が見つかりません");
  return el;
}

function getHamburger() {
  return screen.getByRole("button", { name: "Toggle navigation" });
}

function getOverlay() {
  return screen.getByRole("button", { name: "サイドメニューを閉じる" });
}

function getFooterToggle() {
  return screen.getByRole("button", {
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

describe("SidebarShell / モバイル", () => {
  it("初期状態でSidebarが閉じている", () => {
    renderShell();

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(getSidebarContainer().className).toContain(
      "max-md:-translate-x-full"
    );
  });

  it("Hamburgerから開ける", () => {
    renderShell();

    fireEvent.click(getHamburger());

    expect(getHamburger()).toHaveAttribute("aria-expanded", "true");
    expect(getSidebarContainer().className).toContain("max-md:translate-x-0");
  });

  it("Overlayから閉じられる", () => {
    renderShell();

    fireEvent.click(getHamburger());
    fireEvent.click(getOverlay());

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
    expect(getSidebarContainer().className).toContain(
      "max-md:-translate-x-full"
    );
  });

  it("Escapeから閉じられる", () => {
    renderShell();

    fireEvent.click(getHamburger());
    fireEvent.keyDown(document, { key: "Escape" });

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
  });

  it("Navigation選択後に閉じる", () => {
    renderShell();

    fireEvent.click(getHamburger());
    fireEvent.click(screen.getByRole("link", { name: "ダッシュボード" }));

    expect(getHamburger()).toHaveAttribute("aria-expanded", "false");
  });

  it("Sidebar Headerが表示される", () => {
    renderShell();

    const logo = screen.getByAltText("recwatch");
    const header = logo.closest("div.border-b");
    expect(header?.className).not.toMatch(/(^|\s)hidden(\s|$)/);
  });
});

describe("SidebarShell / タブレット・タッチ", () => {
  it("閉じたSidebarをタップすると展開する", () => {
    renderShell();
    const sidebar = getSidebarContainer();

    fireEvent.click(getFooterToggle());
    expect(sidebar.className).toContain("sidebar-close-width");

    tap(sidebar.querySelector(".sidebar-hover-area")!, "touch");
    expect(sidebar.className).toContain("sidebar-open-width");
  });

  it("最初のタップで意図しないページ遷移が発生しない", () => {
    renderShell();
    const sidebar = getSidebarContainer();
    fireEvent.click(getFooterToggle());

    const dashboardLink = screen.getByRole("link", { name: "ダッシュボード" });
    tap(dashboardLink, "touch");

    expect(sidebar.className).toContain("sidebar-open-width");
    expect(screen.getByTestId("location").textContent).toBe("/");
  });

  it("展開後にNavigationを選択できる", () => {
    renderShell();
    fireEvent.click(getFooterToggle());

    const dashboardLink = screen.getByRole("link", { name: "ダッシュボード" });
    tap(dashboardLink, "touch");
    tap(dashboardLink, "touch");

    expect(screen.getByTestId("location").textContent).toBe("/dashboard");
  });

  it("Footerから閉じられる", () => {
    renderShell();
    const sidebar = getSidebarContainer();

    fireEvent.click(getFooterToggle());

    expect(sidebar.className).toContain("sidebar-close-width");
  });
});

describe("SidebarShell / PC・マウス", () => {
  it("閉じたSidebarへhoverすると一時展開する", () => {
    renderShell();
    const sidebar = getSidebarContainer();
    fireEvent.click(getFooterToggle());

    fireEvent.pointerEnter(sidebar.querySelector(".sidebar-hover-area")!, {
      pointerType: "mouse",
    });

    expect(sidebar.className).toContain("sidebar-open-width");
  });

  it("mouse leaveで元の幅へ戻る", () => {
    renderShell();
    const sidebar = getSidebarContainer();
    fireEvent.click(getFooterToggle());
    const hoverArea = sidebar.querySelector(".sidebar-hover-area")!;

    fireEvent.pointerEnter(hoverArea, { pointerType: "mouse" });
    fireEvent.pointerLeave(hoverArea, { pointerType: "mouse" });

    expect(sidebar.className).toContain("sidebar-close-width");
  });

  it("固定展開中はmouse leaveしても閉じない", () => {
    renderShell();
    const sidebar = getSidebarContainer();
    const hoverArea = sidebar.querySelector(".sidebar-hover-area")!;

    fireEvent.pointerEnter(hoverArea, { pointerType: "mouse" });
    fireEvent.pointerLeave(hoverArea, { pointerType: "mouse" });

    expect(sidebar.className).toContain("sidebar-open-width");
  });

  it("Footerから固定展開・解除できる", () => {
    renderShell();
    const sidebar = getSidebarContainer();

    fireEvent.click(getFooterToggle());
    expect(sidebar.className).toContain("sidebar-close-width");

    fireEvent.click(getFooterToggle());
    expect(sidebar.className).toContain("sidebar-open-width");
  });
});

describe("SidebarShell / ハイブリッド端末", () => {
  it("入力方法を切り替えてもSidebar状態が不整合にならない", () => {
    renderShell();
    const sidebar = getSidebarContainer();
    const hoverArea = sidebar.querySelector(".sidebar-hover-area")!;
    fireEvent.click(getFooterToggle());

    fireEvent.pointerEnter(hoverArea, { pointerType: "mouse" });
    expect(sidebar.className).toContain("sidebar-open-width");
    fireEvent.pointerLeave(hoverArea, { pointerType: "mouse" });
    expect(sidebar.className).toContain("sidebar-close-width");

    tap(hoverArea, "touch");
    expect(sidebar.className).toContain("sidebar-open-width");
  });
});

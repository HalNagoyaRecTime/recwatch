import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("~/features/auth/lib/logout", () => ({ logout: vi.fn() }));
vi.mock("~/features/frame/main-header/search/components/SearchBtn", () => ({
  SearchBtn: () => null,
}));
vi.mock("~/features/frame/main-header/components/NoticeBtn", () => ({
  NoticeBtn: () => null,
}));
vi.mock(
  "~/features/frame/main-header/account-menu/components/AccountBtn",
  () => ({
    AccountBtn: () => null,
  })
);
vi.mock(
  "~/features/frame/main-header/components/MobileHamburgerMenuBtn",
  () => ({
    MobileHamburgerMenuBtn: () => null,
  })
);

import { MainHeader } from "~/features/frame/main-header/components/MainHeader";

afterEach(() => {
  cleanup();
});

describe("MainHeader", () => {
  it("safe-area込みの外枠と52pxの操作行をsticky topに置く", () => {
    render(
      <MemoryRouter>
        <MainHeader />
      </MemoryRouter>
    );

    const header = screen.getByRole("banner");
    const content = header.querySelector(":scope > .relative.z-10");
    const row = header.querySelector(".main-header-row");

    expect(header).toHaveClass("main-header-safe-area", "sticky", "top-0");
    expect(header).not.toHaveClass("main-header-height");
    expect(header.style.paddingTop).toBe("");
    expect(content).toHaveClass("flex", "h-full", "flex-col");
    expect(row).toBeInTheDocument();
    expect(row).toHaveClass(
      "main-header-row",
      "main-header-height",
      "border-b",
      "py-2.5"
    );
  });

  it("Safari sampling用rootをsolidにし、半透明とblurを内側へ分ける", () => {
    render(
      <MemoryRouter>
        <MainHeader />
      </MemoryRouter>
    );

    const header = screen.getByRole("banner");
    const visual = header.querySelector('[data-testid="main-header-visual"]');
    const content = header.querySelector(":scope > .relative.z-10");

    expect(header).toHaveClass("sticky", "top-0", "bg-white", "dark:bg-black");
    expect(header).not.toHaveClass(
      "bg-surface-base",
      "md:bg-surface-layout/95",
      "backdrop-blur-xl"
    );
    expect(visual).toHaveClass(
      "pointer-events-none",
      "absolute",
      "inset-0",
      "bg-surface-base",
      "md:bg-surface-layout/95",
      "backdrop-blur-xl"
    );
    expect(content).toBeInTheDocument();
    expect(content?.firstElementChild).toHaveClass("main-header-row");
  });
});

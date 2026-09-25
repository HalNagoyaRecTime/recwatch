import { readFileSync } from "node:fs";

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

const appCss = readFileSync("app/app.css", "utf8");

afterEach(() => {
  cleanup();
});

describe("MainHeader", () => {
  it("52px rowをsticky topに保ち、top safe areaを高さへ加えない", () => {
    render(
      <MemoryRouter>
        <MainHeader />
      </MemoryRouter>
    );

    const header = screen.getByRole("banner");
    const row = header.querySelector(".main-header-height.main-header-row");

    expect(header).toHaveClass("sticky", "top-0");
    expect(header).not.toHaveClass("main-header-safe-area");
    expect(header.style.paddingTop).toBe("");
    expect(row).toBeInTheDocument();
    expect(appCss).toMatch(/--main-header-row-height:\s*52px;/);
    expect(appCss).not.toContain(".main-header-safe-area");
  });
});

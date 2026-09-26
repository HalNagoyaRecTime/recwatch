import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { PageLayout } from "~/features/frame/page-layout/PageLayout";

vi.mock("~/features/frame/main-header/components/MainHeader", () => ({
  MainHeader: () => null,
}));

import { MainShell } from "~/features/frame/main-header/MainShell";

describe("MainShell", () => {
  it("長いPageLayoutをdocument flowへ渡し、mainを内部scroll ownerにしない", () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route element={<MainShell />}>
            <Route
              path="/"
              element={
                <PageLayout>
                  <div style={{ minHeight: "200vh" }}>長い本文</div>
                </PageLayout>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    const main = screen.getByRole("main");
    const content = screen.getByText("長い本文");
    const footer = screen.getByRole("contentinfo");

    expect(main).toHaveClass("min-w-0", "flex-1", "flex-col");
    expect(main).not.toHaveClass("overflow-hidden", "overflow-y-auto");
    expect(content).toHaveStyle({ minHeight: "200vh" });
    expect(
      content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(container.querySelector(".scrollbar-none")).not.toBeInTheDocument();
  });
});

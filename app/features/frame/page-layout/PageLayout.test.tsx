import { readFileSync } from "node:fs";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

const normalizedCss = readFileSync("app/app.css", "utf8").replace(/\s+/g, " ");

afterEach(() => {
  cleanup();
});

describe("PageLayout", () => {
  it("短い本文もflexで伸ばし、Footerを縮めず本文用ScrollbarAreaを作らない", () => {
    const { container } = render(
      <PageLayout>
        <div>短いページ本文</div>
      </PageLayout>
    );

    const pageLayout = container.querySelector(".page-layout");
    const mainRegion = pageLayout?.firstElementChild;
    const pageMain = mainRegion?.firstElementChild;
    const content = pageMain?.firstElementChild;

    expect(screen.getByText("短いページ本文")).toBeInTheDocument();
    expect(pageLayout).toHaveClass("flex", "flex-col", "flex-1");
    expect(mainRegion).toHaveClass("flex-1");
    expect(pageMain).toHaveClass("flex", "flex-col", "flex-1");
    expect(content).toHaveClass("flex-1");
    expect(screen.getByRole("contentinfo")).toHaveClass("shrink-0");
    expect(container.querySelector(".scrollbar-none")).not.toBeInTheDocument();
    expect(
      container.querySelector(".overscroll-y-contain")
    ).not.toBeInTheDocument();
  });

  it("長い本文の後ろにFooterをdocument flowで置く", () => {
    const { container } = render(
      <PageLayout>
        <div style={{ minHeight: "200vh" }}>長いページ本文</div>
      </PageLayout>
    );
    const content = screen.getByText("長いページ本文");
    const footer = screen.getByRole("contentinfo");

    expect(content).toHaveStyle({ minHeight: "200vh" });
    expect(
      content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(container.querySelector(".scrollbar-none")).not.toBeInTheDocument();
  });

  it("HeaderとSidePanelが単一の52px tokenを共有する", () => {
    expect(normalizedCss).toContain("--main-header-height: 52px;");
    expect(normalizedCss).not.toContain("--main-header-row-height");
    expect(normalizedCss).not.toContain("--main-header-border-width");
    expect(normalizedCss).not.toContain("--main-header-total-height");
    expect(normalizedCss).toContain("height: var(--main-header-height);");
    expect(normalizedCss).toContain("top: var(--main-header-height);");
    expect(normalizedCss).toContain(
      "height: calc(100vh - var(--main-header-height));"
    );
    expect(normalizedCss).toContain(
      "height: calc(100dvh - var(--main-header-height));"
    );
    expect(normalizedCss).toContain(
      'html[data-document-scrollbar="active"] body { scrollbar-width: none; }'
    );
    expect(normalizedCss).toContain(
      "@media (pointer: coarse) { .document-scrollbar [data-scrollbar-track], .document-scrollbar [data-scrollbar-thumb] { pointer-events: none !important; } }"
    );
  });

  it("Footerはsafe areaを加えた外寸42pxをborder込みで確保する", () => {
    expect(normalizedCss).toMatch(
      /\.main-footer-height \{ height: calc\(\s*var\(--main-footer-row-height\)\s*\+\s*env\(safe-area-inset-bottom, 0px\)\s*\); \}/
    );
    expect(normalizedCss).toContain(
      ".main-footer-safe-area { box-sizing: border-box;"
    );
  });

  it("top panelはborder込みの52px boxを使う", () => {
    const { container } = render(
      <PageLayout top={<div>top panel</div>}>
        <div>page content</div>
      </PageLayout>
    );
    const topPanel = container.querySelector(".page-layout > aside");

    expect(topPanel).toHaveClass("main-header-height", "border-b");
    expect(topPanel?.firstElementChild).toHaveClass("h-full");
    expect(topPanel?.firstElementChild).not.toHaveClass("main-header-height");
  });

  it("独立したside panelのlocal scrollは維持する", () => {
    const { container } = render(
      <PageLayout
        right={
          <ScrollbarArea>
            <div>panel content</div>
          </ScrollbarArea>
        }
      >
        <div>page content</div>
      </PageLayout>
    );

    expect(screen.getByText("panel content")).toBeInTheDocument();
    expect(container.querySelector(".page-side-panel")).toHaveClass(
      "page-side-panel"
    );
    expect(container.querySelector(".scrollbar-none")).toHaveClass(
      "overflow-y-auto"
    );
  });
});

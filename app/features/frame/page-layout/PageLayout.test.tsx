import { readFileSync } from "node:fs";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

const appCss = readFileSync("app/app.css", "utf8");

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

  it("SidePanelをHeader基準でstickyに配置し、top safe areaをviewport計算に含めない", () => {
    const fallbackRule = appCss.match(
      /\.page-side-panel\s*\{([\s\S]*?)\}/
    )?.[1];
    const dynamicViewportRule = appCss.match(
      /@supports\s*\(height:\s*100dvh\)\s*\{\s*\.page-side-panel\s*\{([\s\S]*?)\}/
    )?.[1];

    expect(fallbackRule).toBeDefined();
    expect(dynamicViewportRule).toBeDefined();
    expect(fallbackRule).toMatch(/position:\s*sticky\s*;/);
    expect(fallbackRule).toMatch(
      /top:\s*var\(--main-header-total-height\)\s*;/
    );
    expect(fallbackRule).not.toMatch(/safe-area-inset-top/);
    expect(dynamicViewportRule).not.toMatch(/safe-area-inset-top/);

    for (const property of ["height", "max-height"]) {
      expect(fallbackRule).toMatch(
        new RegExp(
          `${property}:\\s*calc\\(\\s*100vh\\s*-\\s*var\\(--main-header-total-height\\)\\s*\\)\\s*;`
        )
      );
      expect(dynamicViewportRule).toMatch(
        new RegExp(
          `${property}:\\s*calc\\(\\s*100dvh\\s*-\\s*var\\(--main-header-total-height\\)\\s*\\)\\s*;`
        )
      );
    }
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

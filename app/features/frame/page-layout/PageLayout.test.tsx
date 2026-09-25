import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

afterEach(() => {
  cleanup();
});

describe("PageLayout", () => {
  it("通常ページ本文をdocument flowへ置き、本文用ScrollbarAreaを作らない", () => {
    const { container } = render(
      <PageLayout>
        <div style={{ minHeight: "200vh" }}>長いページ本文</div>
      </PageLayout>
    );

    expect(screen.getByText("長いページ本文")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(container.querySelector(".scrollbar-none")).not.toBeInTheDocument();
    expect(
      container.querySelector(".overscroll-y-contain")
    ).not.toBeInTheDocument();
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
    expect(container.querySelector(".scrollbar-none")).toBeInTheDocument();
  });
});

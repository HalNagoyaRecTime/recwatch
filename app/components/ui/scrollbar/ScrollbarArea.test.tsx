import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollbarArea } from "./ScrollbarArea";

describe("ScrollbarArea", () => {
  it("一覧の切り替え時だけ縦位置を戻し、横位置とフォーカスは維持する", () => {
    const content = (key: string) => (
      <ScrollbarArea orientation="both" scrollResetKey={key} scrollTabIndex={0}>
        <div>一覧 {key}</div>
      </ScrollbarArea>
    );
    const { container, rerender } = render(content("page-1"));
    const viewport =
      container.querySelector<HTMLDivElement>(".scrollbar-none")!;
    viewport.focus();
    viewport.scrollTop = 300;
    viewport.scrollLeft = 120;

    rerender(content("page-1"));
    expect(viewport.scrollTop).toBe(300);
    expect(viewport.scrollLeft).toBe(120);
    expect(viewport).toHaveFocus();

    rerender(content("page-2"));
    expect(viewport.scrollTop).toBe(0);
    expect(viewport.scrollLeft).toBe(120);
    expect(viewport).toHaveFocus();
  });

  it.each([
    ["vertical", "overflow-y-auto", "overflow-x-hidden", true, false],
    ["horizontal", "overflow-x-auto", "overflow-y-hidden", false, true],
    ["both", "overflow-auto", "overflow-auto", true, true],
  ] as const)(
    "%s local scroll direction keeps its own scroll container and shared tracks",
    (orientation, primary, secondary, hasVerticalTrack, hasHorizontalTrack) => {
      const { container } = render(
        <ScrollbarArea orientation={orientation}>
          <div>local content</div>
        </ScrollbarArea>
      );
      const scrollElement = container.querySelector(".scrollbar-none");

      expect(scrollElement).toHaveClass(primary, secondary);
      expect(scrollElement).toHaveTextContent("local content");
      const verticalTrack = container.querySelector(
        '[data-scrollbar-track="vertical"]'
      );
      const horizontalTrack = container.querySelector(
        '[data-scrollbar-track="horizontal"]'
      );
      if (hasVerticalTrack) expect(verticalTrack).toBeInTheDocument();
      else expect(verticalTrack).toBeNull();
      if (hasHorizontalTrack) expect(horizontalTrack).toBeInTheDocument();
      else expect(horizontalTrack).toBeNull();
    }
  );
});

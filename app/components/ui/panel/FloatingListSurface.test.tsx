import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloatingListSurface } from "./FloatingListSurface";

describe("FloatingListSurface", () => {
  it("scrollableのときだけ共通スクロール領域を使う", () => {
    const { container } = render(
      <FloatingListSurface scrollable>
        <div>内容</div>
      </FloatingListSurface>
    );

    const surface = container.firstElementChild;
    expect(surface).toHaveClass("flex", "flex-col");
    expect(surface).not.toHaveClass("p-2");
    const scrollViewport = surface?.querySelector(".scrollbar-none");
    expect(scrollViewport).toBeInTheDocument();
    expect(scrollViewport).toHaveClass("p-2");
  });

  it("scrollableでないときはスクロール領域を追加しない", () => {
    const { container } = render(
      <FloatingListSurface>
        <div>内容</div>
      </FloatingListSurface>
    );

    expect(container.querySelector(".scrollbar-none")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("p-2");
  });
});

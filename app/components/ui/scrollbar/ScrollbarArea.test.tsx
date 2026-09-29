import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollbarArea } from "./ScrollbarArea";

describe("ScrollbarArea", () => {
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

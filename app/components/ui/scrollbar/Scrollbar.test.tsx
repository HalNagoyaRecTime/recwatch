import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Scrollbar } from "./Scrollbar";
import type { ScrollbarAxisState } from "./useScrollbar";

function renderScrollbar(thumbSize = 40, isVisible = true) {
  const handlers = {
    onThumbPointerCancel: vi.fn(),
    onThumbPointerDown: vi.fn(),
    onThumbPointerMove: vi.fn(),
    onThumbPointerUp: vi.fn(),
    onTrackPointerDown: vi.fn(),
  };
  const axis: ScrollbarAxisState = {
    ...handlers,
    isDragging: false,
    thumbOffset: 0,
    thumbSize,
  };
  const trackRef = createRef<HTMLDivElement>();
  const { container } = render(
    <Scrollbar
      axis={axis}
      isVisible={isVisible}
      orientation="vertical"
      trackRef={trackRef}
    />
  );

  return { container, handlers };
}

describe("Scrollbar", () => {
  it("thumbのpointer操作を共通axis stateへ渡す", () => {
    const { container, handlers } = renderScrollbar();
    const track = container.firstElementChild as HTMLElement;
    const thumb = track.firstElementChild as HTMLElement;

    expect(thumb).toHaveClass("touch-none");

    fireEvent.pointerDown(thumb);
    fireEvent.pointerMove(thumb);
    fireEvent.pointerUp(thumb);
    fireEvent.pointerCancel(thumb);
    fireEvent.pointerDown(track, { bubbles: false });

    expect(handlers.onThumbPointerDown).toHaveBeenCalledTimes(1);
    expect(handlers.onThumbPointerMove).toHaveBeenCalledTimes(1);
    expect(handlers.onThumbPointerUp).toHaveBeenCalledTimes(1);
    expect(handlers.onThumbPointerCancel).toHaveBeenCalledTimes(1);
    expect(handlers.onTrackPointerDown).toHaveBeenCalledTimes(1);
    expect(track).toHaveAttribute("data-scrollbar-track", "vertical");
    expect(thumb).toHaveAttribute("data-scrollbar-thumb", "vertical");
  });

  it("scroll不要または非表示中のtrackは操作を奪わない", () => {
    const noScroll = renderScrollbar(0);
    const hidden = renderScrollbar(40, false);

    expect(noScroll.container.firstElementChild).toHaveClass(
      "pointer-events-none"
    );
    expect(noScroll.container.firstElementChild?.firstElementChild).toBeNull();
    expect(hidden.container.firstElementChild).toHaveClass(
      "pointer-events-none"
    );
  });
});

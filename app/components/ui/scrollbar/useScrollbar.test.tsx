import { fireEvent, render, screen } from "@testing-library/react";
import { useMemo, useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { createElementScrollbarTarget } from "./scrollbar-target";
import { calculateThumbMetrics, useScrollbar } from "./useScrollbar";

function ScrollbarHarness({
  children,
  orientation = "vertical",
}: {
  children?: ReactNode;
  orientation?: "vertical" | "horizontal" | "both";
}) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );
  const target = useMemo(
    () => createElementScrollbarTarget(() => scrollElement),
    [scrollElement]
  );
  const scrollbar = useScrollbar({ orientation, target });
  const { verticalTrackRef, horizontalTrackRef, vertical, horizontal } =
    scrollbar;

  return (
    <div
      data-testid="scrollbar-root"
      onMouseEnter={scrollbar.onMouseEnter}
      onMouseLeave={scrollbar.onMouseLeave}
    >
      <div ref={setScrollElement} data-testid="scroll">
        {children}
      </div>
      <div
        ref={verticalTrackRef}
        data-testid="vertical-track"
        onPointerDown={vertical.onTrackPointerDown}
      >
        <button
          data-testid="vertical-thumb"
          onPointerDown={vertical.onThumbPointerDown}
          onPointerMove={vertical.onThumbPointerMove}
          onPointerUp={vertical.onThumbPointerUp}
          onPointerCancel={vertical.onThumbPointerCancel}
        />
      </div>
      <div
        ref={horizontalTrackRef}
        data-testid="horizontal-track"
        onPointerDown={horizontal.onTrackPointerDown}
      >
        <button
          data-testid="horizontal-thumb"
          onPointerDown={horizontal.onThumbPointerDown}
          onPointerMove={horizontal.onThumbPointerMove}
          onPointerUp={horizontal.onThumbPointerUp}
          onPointerCancel={horizontal.onThumbPointerCancel}
        />
      </div>
      <output data-testid="vertical-dragging">
        {String(vertical.isDragging)}
      </output>
      <output data-testid="horizontal-dragging">
        {String(horizontal.isDragging)}
      </output>
    </div>
  );
}

function setDimensions(
  element: HTMLElement,
  dimensions: Partial<
    Record<
      "scrollHeight" | "clientHeight" | "scrollWidth" | "clientWidth",
      number
    >
  >
) {
  for (const [property, value] of Object.entries(dimensions)) {
    Object.defineProperty(element, property, {
      configurable: true,
      value,
    });
  }
}

function prepareVerticalScroll() {
  const scroll = screen.getByTestId("scroll") as HTMLDivElement;
  const track = screen.getByTestId("vertical-track") as HTMLDivElement;
  const thumb = screen.getByTestId("vertical-thumb") as HTMLButtonElement;

  setDimensions(scroll, { clientHeight: 200, scrollHeight: 1000 });
  setDimensions(track, { clientHeight: 200 });
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
    bottom: 200,
    height: 200,
    left: 0,
    right: 10,
    top: 0,
    width: 10,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  fireEvent.scroll(scroll);

  return { scroll, thumb, track };
}

describe("useScrollbar", () => {
  it("thumbのdragでelement targetのscrollTopを更新する", () => {
    render(<ScrollbarHarness />);
    const { scroll, thumb } = prepareVerticalScroll();
    const setPointerCapture = vi.fn();
    Object.defineProperty(thumb, "setPointerCapture", {
      configurable: true,
      value: setPointerCapture,
    });

    fireEvent.pointerDown(thumb, { clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(thumb, { clientY: 30, pointerId: 1 });

    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(scroll.scrollTop).toBe(100);
    expect(screen.getByTestId("vertical-dragging")).toHaveTextContent("true");
  });

  it.each(["pointerup", "pointercancel"] as const)(
    "%sでdragを終了しpointer captureを解放する",
    (eventName) => {
      render(<ScrollbarHarness />);
      const { thumb } = prepareVerticalScroll();
      const hasPointerCapture = vi.fn().mockReturnValue(true);
      const releasePointerCapture = vi.fn();
      Object.defineProperties(thumb, {
        hasPointerCapture: { configurable: true, value: hasPointerCapture },
        releasePointerCapture: {
          configurable: true,
          value: releasePointerCapture,
        },
        setPointerCapture: { configurable: true, value: vi.fn() },
      });

      fireEvent.pointerDown(thumb, { clientY: 10, pointerId: 1 });
      if (eventName === "pointerup") {
        fireEvent.pointerUp(thumb, { pointerId: 1 });
      } else {
        fireEvent.pointerCancel(thumb, { pointerId: 1 });
      }

      expect(hasPointerCapture).toHaveBeenCalledWith(1);
      expect(releasePointerCapture).toHaveBeenCalledWith(1);
      expect(screen.getByTestId("vertical-dragging")).toHaveTextContent(
        "false"
      );
    }
  );

  it("track clickでelement targetをクリック位置へ移動する", () => {
    render(<ScrollbarHarness />);
    const { scroll, track } = prepareVerticalScroll();

    fireEvent.pointerDown(track, { clientY: 100 });

    expect(scroll.scrollTop).toBe(400);
  });

  it("horizontal axisも同じdrag logicでscrollLeftを更新する", () => {
    render(<ScrollbarHarness orientation="horizontal" />);
    const scroll = screen.getByTestId("scroll") as HTMLDivElement;
    const track = screen.getByTestId("horizontal-track") as HTMLDivElement;
    const thumb = screen.getByTestId("horizontal-thumb") as HTMLButtonElement;

    setDimensions(scroll, { clientWidth: 200, scrollWidth: 1000 });
    setDimensions(track, { clientWidth: 200 });
    fireEvent.scroll(scroll);
    Object.defineProperty(thumb, "setPointerCapture", {
      configurable: true,
      value: vi.fn(),
    });

    fireEvent.pointerDown(thumb, { clientX: 10, pointerId: 1 });
    fireEvent.pointerMove(thumb, { clientX: 30, pointerId: 1 });

    expect(scroll.scrollLeft).toBe(100);
  });

  it("contentがviewport以下ならthumbを表示しない", () => {
    expect(calculateThumbMetrics(200, 200, 200, 0)).toEqual({
      size: 0,
      offset: 0,
    });
    expect(calculateThumbMetrics(1000, 200, 10, 500).size).toBe(10);
  });
});

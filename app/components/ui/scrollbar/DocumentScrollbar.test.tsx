import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DocumentScrollbar } from "./DocumentScrollbar";

const resizeCallbacks: Array<() => void> = [];
const originalDescriptors: Array<{
  target: object;
  property: string;
  descriptor: PropertyDescriptor | undefined;
}> = [];

class TestResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallbacks.push(() => callback([], this));
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
}

function overrideProperty(target: object, property: string, value: unknown) {
  originalDescriptors.push({
    target,
    property,
    descriptor: Object.getOwnPropertyDescriptor(target, property),
  });
  Object.defineProperty(target, property, {
    configurable: true,
    value,
  });
}

function setDocumentSize(scrollHeight: number) {
  overrideProperty(document.documentElement, "scrollHeight", scrollHeight);
  overrideProperty(document.body, "scrollHeight", scrollHeight);
}

function setTrackSize() {
  const track = screen
    .getByTestId("document-scrollbar")
    .querySelector('[data-scrollbar-track="vertical"]') as HTMLDivElement;
  overrideProperty(track, "clientHeight", 200);
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
    bottom: 200,
    height: 200,
    left: 0,
    right: 12,
    top: 0,
    width: 6,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  return track;
}

beforeEach(() => {
  resizeCallbacks.length = 0;
  overrideProperty(window, "innerHeight", 200);
  overrideProperty(window, "innerWidth", 400);
  overrideProperty(window, "scrollY", 0);
  overrideProperty(window, "scrollX", 0);
  overrideProperty(window, "scrollTo", vi.fn());
  setDocumentSize(1000);
  vi.stubGlobal("ResizeObserver", TestResizeObserver);
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-document-scrollbar");
  vi.unstubAllGlobals();
  for (const {
    target,
    property,
    descriptor,
  } of originalDescriptors.reverse()) {
    if (descriptor) Object.defineProperty(target, property, descriptor);
    else Reflect.deleteProperty(target, property);
  }
  originalDescriptors.length = 0;
});

describe("DocumentScrollbar", () => {
  it("document scroll metricsでthumbを描画し、native scroll ownershipを変えない", () => {
    const { unmount } = render(<DocumentScrollbar />);
    const track = setTrackSize();

    act(() => {
      fireEvent.resize(window);
      fireEvent.scroll(window);
    });

    const thumb = track.querySelector(
      '[data-scrollbar-thumb="vertical"]'
    ) as HTMLElement;
    expect(thumb).toHaveStyle({ height: "40px", top: "0px" });
    expect(document.documentElement).toHaveAttribute(
      "data-document-scrollbar",
      "active"
    );
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(document.documentElement.style.overflow).not.toBe("hidden");

    overrideProperty(window, "scrollY", 400);
    fireEvent.scroll(window);
    expect(thumb).toHaveStyle({ top: "80px" });

    unmount();
    expect(document.documentElement).not.toHaveAttribute(
      "data-document-scrollbar"
    );
  });

  it("track clickとthumb dragからdocument scrollを操作する", () => {
    render(<DocumentScrollbar />);
    const track = setTrackSize();
    fireEvent.scroll(window);

    fireEvent.pointerDown(track, { clientY: 100 });
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 400,
      left: 0,
      behavior: "auto",
    });

    const thumb = track.querySelector(
      '[data-scrollbar-thumb="vertical"]'
    ) as HTMLElement;
    Object.defineProperty(thumb, "setPointerCapture", {
      configurable: true,
      value: vi.fn(),
    });
    fireEvent.pointerDown(thumb, { clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(thumb, { clientY: 30, pointerId: 1 });

    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 100,
      left: 0,
      behavior: "auto",
    });
  });

  it("desktop mouseを右端へ置くとvisual scrollbarを表示する", () => {
    render(<DocumentScrollbar />);
    const track = setTrackSize();
    act(() => fireEvent.resize(window));

    act(() => {
      fireEvent.pointerMove(window, {
        pointerType: "mouse",
        clientX: window.innerWidth - 8,
      });
    });

    expect(track).toHaveClass("pointer-events-auto", "opacity-100");
  });

  it("viewportとdocument contentのresizeでthumbを再計算し、不要時は消す", () => {
    render(<DocumentScrollbar />);
    const track = setTrackSize();

    act(() => fireEvent.resize(window));
    const thumb = track.querySelector(
      '[data-scrollbar-thumb="vertical"]'
    ) as HTMLElement;
    expect(thumb).toHaveStyle({ height: "40px" });

    overrideProperty(window, "innerHeight", 400);
    act(() => fireEvent.resize(window));
    expect(thumb).toHaveStyle({ height: "80px" });

    setDocumentSize(200);
    act(() => resizeCallbacks.forEach((callback) => callback()));
    expect(track.querySelector('[data-scrollbar-thumb="vertical"]')).toBeNull();
  });

  it("スクロール不要ならthumbを作らない", () => {
    setDocumentSize(200);
    render(<DocumentScrollbar />);
    const track = setTrackSize();

    act(() => fireEvent.resize(window));
    expect(track.querySelector('[data-scrollbar-thumb="vertical"]')).toBeNull();
  });
});

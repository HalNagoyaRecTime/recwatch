import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@floating-ui/react", () => ({
  autoUpdate: (_anchor: Element, _position: Element, update: () => void) => {
    const handleResize = () => update();
    window.addEventListener("resize", handleResize);
    update();
    return () => window.removeEventListener("resize", handleResize);
  },
}));

import { SearchBtn } from "~/features/frame/main-header/search/components/SearchBtn";

function toDomRect(rect: {
  top: number;
  left: number;
  width: number;
  height: number;
}) {
  return {
    ...rect,
    x: rect.left,
    y: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => rect,
  } as DOMRect;
}

let anchorRect = { top: 12, left: 300, width: 32, height: 40 };
let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
}

describe("SearchBtn", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    anchorRect = { top: 12, left: 300, width: 32, height: 40 };
    setViewport(375, 800);
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: undefined,
    });
    document.body.style.overflow = "";
    document.body.style.overscrollBehavior = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.overscrollBehavior = "";
    if (!window.requestAnimationFrame) {
      Object.defineProperty(window, "requestAnimationFrame", {
        configurable: true,
        value: (callback: FrameRequestCallback) => {
          callback(0);
          return 0;
        },
      });
      Object.defineProperty(window, "cancelAnimationFrame", {
        configurable: true,
        value: () => undefined,
      });
    }
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.hasAttribute("data-search-anchor")) {
        return toDomRect(anchorRect);
      }
      return originalGetBoundingClientRect.call(this);
    };
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("places the closed mobile trigger at the measured anchor without transition", async () => {
    render(<SearchBtn />);

    const trigger = screen.getByRole("button", { name: "画面検索" });

    expect(trigger).toHaveClass("md:hidden");
    await waitFor(() =>
      expect(
        document.querySelector("[data-search-position]")
      ).toBeInTheDocument()
    );
    const searchPosition = document.querySelector<HTMLElement>(
      "[data-search-position]"
    );
    expect(searchPosition).toHaveStyle({
      left: "300px",
      top: "12px",
      width: "32px",
    });
    expect(searchPosition).toHaveClass("transition-none");
  });

  it("expands the same surface into the VisualViewport and focuses the input", async () => {
    render(<SearchBtn />);
    const trigger = await screen.findByRole("button", { name: "画面検索" });

    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: "画面検索" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await waitFor(() =>
      expect(screen.getByRole("searchbox", { name: "画面検索" })).toHaveFocus()
    );
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-label",
      "画面検索の候補"
    );
    expect(
      document.querySelector<HTMLElement>("[data-search-position]")
    ).toHaveStyle({
      left: "16px",
      top: "80px",
      width: "343px",
    });
  });

  it("synchronizes passive resize without animation and animates only close", async () => {
    render(<SearchBtn />);
    const trigger = await screen.findByRole("button", { name: "画面検索" });
    trigger.focus();
    fireEvent.click(trigger);

    await screen.findByRole("searchbox", { name: "画面検索" });
    setViewport(320, 640);
    anchorRect = { top: 10, left: 270, width: 32, height: 40 };
    fireEvent(window, new Event("resize"));

    const position = document.querySelector<HTMLElement>(
      "[data-search-position]"
    );
    expect(position).toHaveStyle({ left: "16px", top: "64px", width: "288px" });
    expect(position).toHaveClass("transition-none");

    fireEvent.keyDown(screen.getByRole("searchbox", { name: "画面検索" }), {
      key: "Escape",
    });
    expect(position).toHaveStyle({ left: "270px", top: "10px", width: "32px" });
    expect(position).toHaveClass("transition-[top,left,width,height]");
  });

  it("keeps Tab and Shift+Tab inside the dialog and inerts the background", async () => {
    render(
      <>
        <div data-testid="background-root">
          <button type="button">背面ボタン</button>
        </div>
        <SearchBtn />
      </>
    );

    const trigger = await screen.findByRole("button", { name: "画面検索" });
    trigger.focus();
    fireEvent.click(trigger);
    const input = await screen.findByRole("searchbox", { name: "画面検索" });
    const backgroundRoot = screen.getByTestId("background-root");

    expect(backgroundRoot.parentElement).toHaveAttribute("inert");

    input.focus();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: "Tab", shiftKey: true });
    expect(input).toHaveFocus();

    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(backgroundRoot.parentElement).not.toHaveAttribute("inert");
  });

  it("opens with Ctrl+K and Meta+K, but ignores IME composition", async () => {
    render(<SearchBtn />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(
      await screen.findByRole("dialog", { name: "画面検索" })
    ).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );

    fireEvent.keyDown(window, {
      key: "k",
      ctrlKey: true,
      isComposing: true,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(
      await screen.findByRole("dialog", { name: "画面検索" })
    ).toBeInTheDocument();
  });

  it("handles keyboard selection, IME composition, and empty results", async () => {
    render(<SearchBtn />);
    fireEvent.click(await screen.findByRole("button", { name: "画面検索" }));
    const input = await screen.findByRole("searchbox", { name: "画面検索" });

    expect(screen.getAllByRole("option")[0]).toHaveAttribute(
      "aria-selected",
      "true"
    );
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1]).toHaveAttribute(
      "aria-selected",
      "true"
    );
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(mockNavigate).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith("/events");
  });

  it("does not navigate when the query has no results", async () => {
    render(<SearchBtn />);
    fireEvent.click(await screen.findByRole("button", { name: "画面検索" }));
    const input = await screen.findByRole("searchbox", { name: "画面検索" });
    fireEvent.change(input, { target: { value: "存在しない画面" } });
    expect(within(screen.getByRole("dialog")).queryByRole("option")).toBe(null);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

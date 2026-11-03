import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchBtn } from "~/features/frame/main-header/search/components/SearchBtn";

const animationFrames = new Map<number, FrameRequestCallback>();
let nextFrameId = 0;
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView"
);

function flushAnimationFrame() {
  act(() => {
    const callbacks = [...animationFrames.values()];
    animationFrames.clear();
    callbacks.forEach((callback) => callback(0));
  });
}

function finishOpening() {
  flushAnimationFrame();
  flushAnimationFrame();
  act(() => {
    vi.advanceTimersByTime(220);
  });
}

function getSearchInput() {
  return screen.getByPlaceholderText("画面を検索...");
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

function renderSearch() {
  render(
    <MemoryRouter initialEntries={["/events"]}>
      <header>
        <SearchBtn />
        <button type="button">通知</button>
        <button type="button">アカウントメニュー</button>
      </header>
      <LocationProbe />
    </MemoryRouter>
  );

  return screen.getByRole("banner");
}

beforeEach(() => {
  vi.useFakeTimers();
  animationFrames.clear();
  nextFrameId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    nextFrameId += 1;
    animationFrames.set(nextFrameId, callback);
    return nextFrameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (frameId: number) => {
    animationFrames.delete(frameId);
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  animationFrames.clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  if (originalScrollIntoView) {
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      originalScrollIntoView
    );
  } else {
    delete (HTMLElement.prototype as { scrollIntoView?: unknown })
      .scrollIntoView;
  }
});

describe("SearchBtn", () => {
  it("閉じた検索欄を通知・アカウントと同じヘッダー内に置く", () => {
    const header = renderSearch();

    expect(header).toContainElement(getSearchInput());
    expect(screen.getAllByPlaceholderText("画面を検索...")).toHaveLength(1);
    expect(getSearchInput()).not.toHaveFocus();
    expect(document.body.style.overflow).toBe("");

    fireEvent.scroll(window);
    flushAnimationFrame();

    expect(header).toContainElement(getSearchInput());
    expect(screen.getByRole("button", { name: "通知" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "アカウントメニュー" })
    ).toBeInTheDocument();
  });

  it("クリックでPortalへ展開し、Escによる収縮後にヘッダーへ戻す", () => {
    const header = renderSearch();
    fireEvent.click(getSearchInput().closest("button")!);

    expect(header).not.toContainElement(getSearchInput());
    expect(document.body.style.overflow).toBe("hidden");
    finishOpening();
    expect(getSearchInput()).toHaveFocus();

    fireEvent.keyDown(getSearchInput(), { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(header).not.toContainElement(getSearchInput());

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(header).toContainElement(getSearchInput());
    expect(screen.getAllByPlaceholderText("画面を検索...")).toHaveLength(1);
    expect(document.body.style.overflow).toBe("");
  });

  it.each(["ctrlKey", "metaKey"] as const)(
    "%s + Kで開き、絞り込んだ検索結果をキーボードで選択する",
    (modifier) => {
      const header = renderSearch();
      fireEvent.keyDown(window, { key: "k", [modifier]: true });
      finishOpening();

      expect(header).not.toContainElement(getSearchInput());
      expect(getSearchInput()).toHaveFocus();
      fireEvent.change(getSearchInput(), { target: { value: "イベント" } });
      expect(
        screen.queryByRole("button", { name: /学生管理/ })
      ).not.toBeInTheDocument();

      fireEvent.keyDown(getSearchInput(), { key: "ArrowDown" });
      fireEvent.keyDown(getSearchInput(), { key: "Enter" });
      expect(screen.getByTestId("current-path")).toHaveTextContent(
        "/events/new"
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(header).toContainElement(getSearchInput());
      expect(getSearchInput()).toHaveValue("");
    }
  );

  it("閉じる途中に再度開いても、古い終了処理で閉じない", () => {
    const header = renderSearch();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    finishOpening();

    fireEvent.keyDown(getSearchInput(), { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    finishOpening();
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(header).not.toContainElement(getSearchInput());
    expect(getSearchInput()).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(getSearchInput(), { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(header).toContainElement(getSearchInput());
    expect(document.body.style.overflow).toBe("");
  });

  it("入力欄へのフォーカスで開いても入力を続けられ、閉じると起点へフォーカスを戻す", () => {
    const header = renderSearch();
    act(() => {
      getSearchInput().focus();
    });

    expect(header).not.toContainElement(getSearchInput());
    expect(getSearchInput()).toHaveFocus();
    fireEvent.change(getSearchInput(), { target: { value: "クラス" } });
    finishOpening();
    expect(getSearchInput()).toHaveValue("クラス");

    fireEvent.keyDown(getSearchInput(), { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(header).toContainElement(getSearchInput());
    expect(getSearchInput().closest("button")).toHaveFocus();
    expect(getSearchInput()).toHaveValue("");
    flushAnimationFrame();
    expect(header).toContainElement(getSearchInput());
  });

  it("閉じる途中で別の操作へ移った場合はフォーカスを奪わない", () => {
    const header = renderSearch();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    finishOpening();
    fireEvent.keyDown(getSearchInput(), { key: "Escape" });
    const notificationButton = screen.getByRole("button", { name: "通知" });
    act(() => {
      notificationButton.focus();
      vi.advanceTimersByTime(400);
    });

    expect(header).toContainElement(getSearchInput());
    expect(notificationButton).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it.each(["クリック", "ショートカット"])(
    "%sで開き始めにEscを押しても、後から展開されない",
    (method) => {
      const header = renderSearch();
      if (method === "クリック") {
        fireEvent.click(getSearchInput().closest("button")!);
      } else {
        fireEvent.keyDown(window, { key: "k", ctrlKey: true });
      }
      fireEvent.keyDown(window, { key: "Escape" });
      flushAnimationFrame();
      flushAnimationFrame();
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(header).toContainElement(getSearchInput());
      expect(document.body.style.overflow).toBe("");
    }
  );
});

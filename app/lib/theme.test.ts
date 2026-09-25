import { act, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "~/components/providers/ThemeProvider";

import { applyTheme, THEME_STORAGE_KEY } from "./theme";

describe("applyTheme", () => {
  beforeEach(() => {
    const root = document.documentElement;
    root.className = "";
    root.removeAttribute("data-theme");
    root.removeAttribute("data-document-background-override");
    root.style.removeProperty("color-scheme");
    root.style.removeProperty("background-color");
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ダークモードではブラウザ標準部品もダーク配色にする", () => {
    applyTheme("dark");

    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.style.backgroundColor).toBe("rgb(0, 0, 0)");
  });

  it("ライトモードへ戻すとブラウザ標準部品もライト配色に戻す", () => {
    applyTheme("light");

    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.documentElement.style.backgroundColor).toBe(
      "rgb(255, 255, 255)"
    );
  });

  it("systemテーマの変更に合わせてdocument背景を更新する", () => {
    let matchesDark = false;
    let handleChange: (() => void) | undefined;
    const mediaQuery = {
      get matches() {
        return matchesDark;
      },
      addEventListener: vi.fn(
        (_type: string, listener: () => void) => (handleChange = listener)
      ),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => mediaQuery)
    );
    window.localStorage.setItem(THEME_STORAGE_KEY, "system");

    const { unmount } = render(
      createElement(ThemeProvider, null, createElement("div"))
    );

    expect(document.documentElement.style.backgroundColor).toBe(
      "rgb(255, 255, 255)"
    );

    act(() => {
      matchesDark = true;
      handleChange?.();
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.backgroundColor).toBe("rgb(0, 0, 0)");

    unmount();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });
});

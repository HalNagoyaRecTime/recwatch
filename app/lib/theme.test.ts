import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { createElement, useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ThemeContext,
  ThemeProvider,
} from "~/components/providers/ThemeProvider";

import { applyTheme, THEME_STORAGE_KEY, type ThemeMode } from "./theme";

type ThemeSnapshot = {
  isDark: boolean;
  theme: string | undefined;
  colorScheme: string;
  rootBackground: string;
  bodyBackground: string;
};

function ThemeSelectionProbe({
  onApplied,
}: {
  onApplied: (snapshot: ThemeSnapshot) => void;
}) {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProviderが必要です");

  const selectTheme = (theme: ThemeMode) => {
    context.setTheme(theme);
    onApplied({
      isDark: document.documentElement.classList.contains("dark"),
      theme: document.documentElement.dataset.theme,
      colorScheme: document.documentElement.style.colorScheme,
      rootBackground: document.documentElement.style.backgroundColor,
      bodyBackground: document.body.style.backgroundColor,
    });
  };

  return createElement(
    "div",
    null,
    createElement("button", { onClick: () => selectTheme("dark") }, "dark"),
    createElement("button", { onClick: () => selectTheme("light") }, "light")
  );
}

describe("applyTheme", () => {
  beforeEach(() => {
    const root = document.documentElement;
    root.className = "";
    root.removeAttribute("data-theme");
    root.removeAttribute("data-document-background-override");
    root.style.removeProperty("color-scheme");
    root.style.removeProperty("background-color");
    document.body.style.removeProperty("background-color");
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("ダークモードではブラウザ標準部品もダーク配色にする", () => {
    applyTheme("dark");

    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(document.body.style.backgroundColor).toBe("rgb(0, 0, 0)");
  });

  it("ライトモードへ戻すとブラウザ標準部品もライト配色に戻す", () => {
    applyTheme("light");

    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.documentElement.style.backgroundColor).toBe(
      "rgb(255, 255, 255)"
    );
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)");
  });

  it("ユーザー操作と同じイベント内でrootとbackgroundへ同期反映する", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    const snapshots: ThemeSnapshot[] = [];
    render(
      createElement(
        ThemeProvider,
        null,
        createElement(ThemeSelectionProbe, {
          onApplied: (snapshot: ThemeSnapshot) => snapshots.push(snapshot),
        })
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "dark" }));
    fireEvent.click(screen.getByRole("button", { name: "light" }));

    expect(snapshots).toEqual([
      {
        isDark: true,
        theme: "dark",
        colorScheme: "dark",
        rootBackground: "rgb(0, 0, 0)",
        bodyBackground: "rgb(0, 0, 0)",
      },
      {
        isDark: false,
        theme: "light",
        colorScheme: "light",
        rootBackground: "rgb(255, 255, 255)",
        bodyBackground: "rgb(255, 255, 255)",
      },
    ]);
  });

  it("systemテーマはmatchMediaの現在値から背景色を決める", () => {
    let matchesDark = false;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: matchesDark }) as MediaQueryList)
    );

    applyTheme("system");
    expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(document.documentElement).not.toHaveClass("dark");

    matchesDark = true;
    applyTheme("system");
    expect(document.body.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(document.documentElement).toHaveClass("dark");
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
    expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)");

    act(() => {
      matchesDark = true;
      handleChange?.();
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(document.body.style.backgroundColor).toBe("rgb(0, 0, 0)");

    unmount();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });
});

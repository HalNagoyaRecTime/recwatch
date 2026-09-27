import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "./ThemeProvider";
import { useThemeMode } from "~/hooks/useThemeMode";

function ThemeProbe() {
  const { theme, setTheme } = useThemeMode();

  return <button onClick={() => setTheme("light")}>{theme}</button>;
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.removeProperty("color-scheme");
});

describe("ThemeProvider forcedTheme", () => {
  it("forced lightを適用し、保存済みテーマを維持したまま解除後に復元する", () => {
    window.localStorage.setItem("recwatch-theme", "dark");
    const getItem = vi.spyOn(window.localStorage, "getItem");

    const { rerender } = render(
      <ThemeProvider forcedTheme="light">
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByRole("button")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(getItem).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button"));
    expect(window.localStorage.getItem("recwatch-theme")).toBe("dark");

    rerender(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("recwatch-theme")).toBe("dark");
    getItem.mockRestore();
  });
});

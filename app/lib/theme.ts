export const THEME_STORAGE_KEY = "recwatch-theme";

export type ThemeMode = "dark" | "light";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "dark" || value === "light";
}

export function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return "dark";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

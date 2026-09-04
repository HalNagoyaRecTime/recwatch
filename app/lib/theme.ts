export const THEME_STORAGE_KEY = "recwatch-theme";

export type ThemeMode = "dark" | "light" | "system";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "dark" || value === "light" || value === "system";
}

export function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return "system";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", isDark);
  root.dataset.theme = theme;
  root.style.colorScheme = isDark ? "dark" : "light";
}

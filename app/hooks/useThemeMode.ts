import { useEffect, useState } from "react";

import {
  applyTheme,
  getPreferredTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "~/lib/theme";

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const updateTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return {
    theme,
    setTheme: updateTheme,
    toggleTheme: () => updateTheme(theme === "dark" ? "light" : "dark"),
  };
}

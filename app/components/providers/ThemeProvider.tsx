import {
  createContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  getPreferredTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "~/lib/theme";

export type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  forcedTheme,
}: {
  children: ReactNode;
  forcedTheme?: ThemeMode;
}) {
  const [preferredTheme, setPreferredTheme] = useState<ThemeMode | null>(() =>
    forcedTheme ? null : getPreferredTheme()
  );
  const theme = forcedTheme ?? preferredTheme ?? getPreferredTheme();

  useLayoutEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = (nextTheme: ThemeMode) => {
    if (forcedTheme) {
      return;
    }

    setPreferredTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

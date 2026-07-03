import { createContext, useEffect, useState, type ReactNode } from "react";

export type NavState = {
  isOpen: boolean;
  openAccordions: string[];
};

export type NavContextType = NavState & {
  toggle: () => void;
  toggleAccordion: (id: string) => void;
  closeForMobile: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const NavContext = createContext<NavContextType | undefined>(undefined);

const NAV_STORAGE_KEY = "rectime-nav-state";

function getInitialState(): NavState {
  if (typeof window === "undefined") {
    return { isOpen: true, openAccordions: [] };
  }
  try {
    const item = window.localStorage.getItem(NAV_STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed.state) {
        return parsed.state;
      }
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse nav state from storage", error);
  }
  return { isOpen: true, openAccordions: [] };
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavState>(() => getInitialState());

  useEffect(() => {
    window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify({ state }));
  }, [state]);

  const toggle = () => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  };

  const toggleAccordion = (id: string) => {
    setState((prev) => ({
      ...prev,
      openAccordions: prev.openAccordions.includes(id)
        ? prev.openAccordions.filter((value) => value !== id)
        : [...prev.openAccordions, id],
    }));
  };

  const closeForMobile = () => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      openAccordions: [],
    }));
  };

  return (
    <NavContext.Provider
      value={{ ...state, toggle, toggleAccordion, closeForMobile }}
    >
      {children}
    </NavContext.Provider>
  );
}

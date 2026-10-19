import { createContext, useEffect, useState, type ReactNode } from "react";

export type SidebarState = {
  isOpen: boolean;
  openAccordions: string[];
  toggle: () => void;
  toggleAccordion: (id: string) => void;
  closeForMobile: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SidebarStateContext = createContext<SidebarState | undefined>(
  undefined
);

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("rectime-nav-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const stateData = parsed.state ? parsed.state : parsed;
        if (stateData.isOpen !== undefined) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsOpen(stateData.isOpen);
        }
        if (stateData.openAccordions !== undefined) {
          setOpenAccordions(stateData.openAccordions);
        }
      } catch (e) {
        console.error(
          "セッションストレージからのナビゲーション状態の復元に失敗しました",
          e
        );
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    sessionStorage.setItem(
      "rectime-nav-state",
      JSON.stringify({ state: { isOpen, openAccordions }, version: 0 })
    );
  }, [isOpen, openAccordions, isLoaded]);

  const toggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const closeForMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 720) {
      setIsOpen(false);
      setOpenAccordions([]);
    }
  };

  return (
    <SidebarStateContext.Provider
      value={{
        isOpen,
        openAccordions,
        toggle,
        toggleAccordion,
        closeForMobile,
      }}
    >
      {children}
    </SidebarStateContext.Provider>
  );
}

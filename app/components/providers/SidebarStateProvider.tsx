import { createContext, useEffect, useState, type ReactNode } from "react";

export type SidebarState = {
  mobileOpen: boolean;
  sidebarPinnedOpen: boolean;
  openAccordions: string[];
  toggleMobileDrawer: () => void;
  closeForMobile: () => void;
  togglePinned: () => void;
  pinOpen: () => void;
  toggleAccordion: (id: string) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SidebarStateContext = createContext<SidebarState | undefined>(
  undefined
);

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(true);
  const [sidebarPinnedOpen, setSidebarPinnedOpen] = useState(true);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("rectime-nav-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const stateData = parsed.state ? parsed.state : parsed;
        if (stateData.sidebarPinnedOpen !== undefined) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSidebarPinnedOpen(stateData.sidebarPinnedOpen);
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
      JSON.stringify({
        state: { sidebarPinnedOpen, openAccordions },
        version: 1,
      })
    );
  }, [sidebarPinnedOpen, openAccordions, isLoaded]);

  const toggleMobileDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const closeForMobile = () => {
    setMobileOpen(false);
  };

  const togglePinned = () => {
    setSidebarPinnedOpen((prev) => !prev);
  };

  const pinOpen = () => {
    setSidebarPinnedOpen(true);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <SidebarStateContext.Provider
      value={{
        mobileOpen,
        sidebarPinnedOpen,
        openAccordions,
        toggleMobileDrawer,
        closeForMobile,
        togglePinned,
        pinOpen,
        toggleAccordion,
      }}
    >
      {children}
    </SidebarStateContext.Provider>
  );
}

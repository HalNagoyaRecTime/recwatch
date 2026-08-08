import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SIDEBAR_MOBILE_MEDIA_QUERY,
  getIsSidebarMobileViewport,
} from "~/features/frame/sidebar/constants/sidebar-responsive";

export type SidebarState = {
  isMobile: boolean;
  isOpen: boolean;
  openAccordions: string[];
  toggle: () => void;
  toggleAccordion: (id: string) => void;
  closeForMobile: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SidebarStateContext = createContext<SidebarState | undefined>(
  undefined,
);

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const initialIsMobile = getIsSidebarMobileViewport();
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  const [isOpen, setIsOpen] = useState(!initialIsMobile);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobileRef = useRef(initialIsMobile);
  const isOpenRef = useRef(isOpen);
  const desktopOpenPreference = useRef(!initialIsMobile);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(SIDEBAR_MOBILE_MEDIA_QUERY);
    const handleChange = () => {
      const nextIsMobile = mediaQuery.matches;
      if (nextIsMobile === isMobileRef.current) return;

      if (nextIsMobile) {
        desktopOpenPreference.current = isOpenRef.current;
        setIsOpen(false);
        setOpenAccordions([]);
      } else {
        setIsOpen(desktopOpenPreference.current);
      }

      isMobileRef.current = nextIsMobile;
      setIsMobile(nextIsMobile);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("rectime-nav-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const stateData = parsed.state ? parsed.state : parsed;
        if (!initialIsMobile && stateData.isOpen !== undefined) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsOpen(stateData.isOpen);
          desktopOpenPreference.current = stateData.isOpen;
        }
        if (!initialIsMobile && stateData.openAccordions !== undefined) {
          setOpenAccordions(stateData.openAccordions);
        }
      } catch (e) {
        console.error(
          "セッションストレージからのナビゲーション状態の復元に失敗しました",
          e,
        );
      }
    }
    setIsLoaded(true);
  }, [initialIsMobile]);

  useEffect(() => {
    if (!isLoaded || isMobile) return;
    sessionStorage.setItem(
      "rectime-nav-state",
      JSON.stringify({ state: { isOpen, openAccordions }, version: 0 }),
    );
  }, [isOpen, openAccordions, isLoaded, isMobile]);

  const toggle = useCallback(() => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  }, []);

  const toggleAccordion = useCallback((id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }, []);

  const closeForMobile = useCallback(() => {
    if (isMobile) {
      setIsOpen(false);
      setOpenAccordions([]);
    }
  }, [isMobile]);

  return (
    <SidebarStateContext.Provider
      value={{
        isMobile,
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

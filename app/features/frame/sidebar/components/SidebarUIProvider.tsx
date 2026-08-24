import { createContext, useState, type ReactNode } from "react";
import { useSidebarState } from "~/hooks/useSidebarState";

export type SidebarUIState = {
  isHovering: boolean;
  setHovering: (value: boolean) => void;
  isExpanded: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SidebarUIContext = createContext<SidebarUIState | undefined>(
  undefined
);

export function SidebarUIProvider({ children }: { children: ReactNode }) {
  const [isHovering, setHovering] = useState(false);
  const { mobileOpen, sidebarPinnedOpen } = useSidebarState();

  const isExpanded = mobileOpen || sidebarPinnedOpen || isHovering;

  return (
    <SidebarUIContext.Provider value={{ isHovering, setHovering, isExpanded }}>
      {children}
    </SidebarUIContext.Provider>
  );
}

import { createContext, useState, type ReactNode } from "react";

export type NavigationHoverState = {
  isHovering: boolean;
  setHovering: (value: boolean) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const NavigationHoverContext = createContext<
  NavigationHoverState | undefined
>(undefined);

export function NavigationHoverProvider({ children }: { children: ReactNode }) {
  const [isHovering, setHovering] = useState(false);

  return (
    <NavigationHoverContext.Provider value={{ isHovering, setHovering }}>
      {children}
    </NavigationHoverContext.Provider>
  );
}

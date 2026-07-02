import { createContext, useState, type ReactNode } from "react";

export type LeftNavigationHoverState = {
  isHovering: boolean;
  setHovering: (value: boolean) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const LeftNavigationHoverContext = createContext<
  LeftNavigationHoverState | undefined
>(undefined);

export function LeftNavigationHoverProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isHovering, setHovering] = useState(false);

  return (
    <LeftNavigationHoverContext.Provider value={{ isHovering, setHovering }}>
      {children}
    </LeftNavigationHoverContext.Provider>
  );
}

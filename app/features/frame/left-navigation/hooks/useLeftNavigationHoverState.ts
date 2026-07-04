import { useContext } from "react";
import { LeftNavigationHoverContext } from "~/features/frame/left-navigation/components/LeftNavigationHoverProvider";

export function useLeftNavigationHoverState() {
  const context = useContext(LeftNavigationHoverContext);
  if (!context) {
    throw new Error(
      "useLeftNavigationHoverState must be used within a LeftNavigationHoverProvider"
    );
  }
  return context;
}

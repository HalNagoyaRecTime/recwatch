import { useContext } from "react";
import { NavigationHoverContext } from "~/features/frame/navigation/components/NavigationHoverProvider";

export function useNavigationHoverState() {
  const context = useContext(NavigationHoverContext);
  if (!context) {
    throw new Error(
      "useNavigationHoverState must be used within a NavigationHoverProvider"
    );
  }
  return context;
}

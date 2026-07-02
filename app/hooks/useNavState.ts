import { useContext } from "react";
import { NavContext } from "~/components/providers/NavProvider";

export function useNavState() {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavState must be used within a NavProvider");
  }
  return context;
}

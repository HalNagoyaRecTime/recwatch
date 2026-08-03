import { useContext } from "react";
import { SidebarStateContext } from "~/components/providers/SidebarStateProvider";

export function useSidebarState() {
  const context = useContext(SidebarStateContext);
  if (!context) {
    throw new Error(
      "useSidebarState は SidebarStateProvider の内側で使用する必要があります"
    );
  }
  return context;
}

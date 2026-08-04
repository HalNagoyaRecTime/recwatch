import { useContext } from "react";
import { SidebarUIContext } from "~/features/frame/sidebar/components/SidebarUIProvider";

export function useSidebarUI() {
  const context = useContext(SidebarUIContext);
  if (!context) {
    throw new Error(
      "useSidebarUI は SidebarUIProvider の内側で使用する必要があります"
    );
  }
  return context;
}

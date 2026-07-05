import { SidebarShell } from "~/features/frame/sidebar/SidebarShell";
import { MainShell } from "~/features/frame/main-header/MainShell";
import { SidebarStateProvider } from "~/hooks/useSidebarState";

export function AppShell() {
  return (
    <SidebarStateProvider>
      <div className="flex h-dvh overflow-hidden md:flex-row">
        <SidebarShell />
        <MainShell />
      </div>
    </SidebarStateProvider>
  );
}

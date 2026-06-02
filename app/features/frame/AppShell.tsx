import { LeftNavigationShell } from "~/features/frame/left-navigation/LeftNavigationShell";
import { MainShell } from "~/features/frame/main-header/MainShell";

export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden md:flex-row">
      <LeftNavigationShell />
      <MainShell />
    </div>
  );
}

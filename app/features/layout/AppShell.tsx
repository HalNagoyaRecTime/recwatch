import { LeftNavigationShell } from "~/features/layout/left-navigation/LeftNavigationShell";
import { MainShell } from "~/features/layout/main-header/MainShell";

export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden md:flex-row">
      <LeftNavigationShell />
      <MainShell />
    </div>
  );
}

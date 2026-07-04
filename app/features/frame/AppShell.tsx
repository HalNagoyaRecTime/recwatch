import { NavigationShell } from "~/features/frame/navigation/NavigationShell";
import { MainShell } from "~/features/frame/main-header/MainShell";

export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden md:flex-row">
      <NavigationShell />
      <MainShell />
    </div>
  );
}

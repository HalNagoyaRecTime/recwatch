import { NavigationShell } from "~/features/frame/navigation/NavigationShell";
import { MainShell } from "~/features/frame/main-header/MainShell";
import { NavigationStateProvider } from "~/hooks/useNavState";

export function AppShell() {
  return (
    <NavigationStateProvider>
      <div className="flex h-dvh overflow-hidden md:flex-row">
        <NavigationShell />
        <MainShell />
      </div>
    </NavigationStateProvider>
  );
}

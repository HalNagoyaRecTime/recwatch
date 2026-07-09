import { LeftNavigationShell } from "~/features/frame/left-navigation/LeftNavigationShell";
import { MainShell } from "~/features/frame/main-header/MainShell";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AppShellProps = {
  user?: AccountUser | null;
};

export function AppShell({ user }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden md:flex-row">
      <LeftNavigationShell />
      <MainShell user={user} />
    </div>
  );
}

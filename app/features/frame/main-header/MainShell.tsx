import { Outlet } from "react-router";

import { MainHeader } from "~/features/frame/main-header/components/MainHeader";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type MainShellProps = {
  user?: AccountUser | null;
};

export function MainShell({ user }: MainShellProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MainHeader user={user} />
      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from "react-router";

import { MainHeader } from "~/features/frame/main-header/components/MainHeader";
import MainFooter from "~/features/frame/main-header/components/MainFooter";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type MainShellProps = {
  user?: AccountUser | null;
};

export function MainShell({ user }: MainShellProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MainHeader user={user} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="flex min-h-full flex-col">
          <div className="flex-1 p-[18px] md:p-6">
            <Outlet />
          </div>
          <MainFooter />
        </div>
      </main>
    </div>
  );
}

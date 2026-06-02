import { Outlet } from "react-router";

import { MainHeader } from "~/features/frame/main-header/components/MainHeader";
import MainFooter from "~/features/frame/main-header/components/MainFooter";

export function MainShell() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MainHeader />
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

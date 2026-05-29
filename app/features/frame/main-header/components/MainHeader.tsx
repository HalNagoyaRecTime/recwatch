import { useNavigate } from "react-router";

import { logout } from "~/features/auth/lib/logout";
import { SearchBtn } from "~/features/frame/main-header/search/components/SearchBtn";
import { NoticeBtn } from "~/features/frame/main-header/components/NoticeBtn";
import { AccountBtn } from "~/features/frame/main-header/account-menu/components/AccountBtn";
import { EventSwitcherBtn } from "~/features/frame/main-header/event-switcher/components/EventSwitcherBtn";
import { MobileHamburgerMenuBtn } from "~/features/frame/main-header/components/MobileHamburgerMenuBtn";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type MainHeaderProps = {
  user?: AccountUser | null;
};

export function MainHeader({ user }: MainHeaderProps) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="main-header-height sticky top-0 z-30 flex items-center justify-between border-b border-(--border-1) bg-(--surface-overlay)/95 px-3 py-2.5 backdrop-blur-xl">
      <div className="flex h-full">
        <MobileHamburgerMenuBtn />
        <EventSwitcherBtn />
      </div>

      <div className="flex h-full gap-1">
        <SearchBtn />
        <NoticeBtn />
        <AccountBtn user={user} onLogout={() => void handleLogout()} />
      </div>
    </header>
  );
}

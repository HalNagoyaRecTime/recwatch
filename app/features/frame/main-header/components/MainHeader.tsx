import { useNavigate } from "react-router";

import { logout } from "~/features/auth/lib/logout";
import { SearchBtn } from "~/features/frame/main-header/search/components/SearchBtn";
import { NoticeBtn } from "~/features/frame/main-header/components/NoticeBtn";
import { AccountBtn } from "~/features/frame/main-header/account-menu/components/AccountBtn";

import { MobileHamburgerMenuBtn } from "~/features/frame/main-header/components/MobileHamburgerMenuBtn";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type MainHeaderProps = {
  user?: AccountUser | null;
};

export function MainHeader({ user }: MainHeaderProps) {
  const navigate = useNavigate();

  async function handleLogout() {
    const result = await logout(user?.id).catch(
      () => ({ status: "error" }) as const
    );

    if (result.status === "error") {
      navigate("/login?error=logout_failed", { replace: true });
      return;
    }

    if (result.msLogoutUrl) {
      window.location.href = result.msLogoutUrl;
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <header className="border-border-subtle bg-surface-base md:bg-surface-layout/95 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="main-header-height main-header-row flex items-center justify-between">
        <div className="flex h-full min-w-0 flex-1">
          <MobileHamburgerMenuBtn />
        </div>

        <div className="flex h-full shrink-0 gap-1 md:min-w-0 md:shrink">
          <SearchBtn />
          <NoticeBtn />
          <AccountBtn user={user} onLogout={() => void handleLogout()} />
        </div>
      </div>
    </header>
  );
}

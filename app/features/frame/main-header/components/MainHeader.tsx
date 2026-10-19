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

  // SafariのブラウザUI向けに外枠は単色にし、safe-area下の操作行だけを透過・blurする。
  return (
    <header className="main-header-safe-area sticky top-0 z-30 bg-white dark:bg-black">
      <div
        aria-hidden="true"
        data-testid="main-header-visual"
        className="bg-surface-base md:bg-surface-layout/95 pointer-events-none absolute inset-0 backdrop-blur-xl"
      />
      <div className="relative z-10 flex h-full flex-col">
        <div className="main-header-row main-header-height border-border-subtle flex items-center justify-between border-b py-2.5">
          <div className="flex h-full min-w-0 flex-1">
            <MobileHamburgerMenuBtn />
          </div>

          <div className="flex h-full shrink-0 gap-1 md:min-w-0 md:shrink">
            <SearchBtn />
            <NoticeBtn />
            <AccountBtn user={user} onLogout={() => void handleLogout()} />
          </div>
        </div>
      </div>
    </header>
  );
}

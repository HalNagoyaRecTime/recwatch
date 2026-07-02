import {
  LogOutIcon,
  MoonStarIcon,
  SettingsIcon,
  SunMediumIcon,
  User2Icon,
} from "lucide-react";

import { useThemeMode } from "~/hooks/useThemeMode";
import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { Menu, type MenuItemType } from "~/components/ui/Menu";

type AccountMenuPanelProps = {
  account: AccountBtnData;
  onClose: () => void;
  onLogout?: () => void;
};

export function AccountMenuPanel({
  account,
  onClose,
  onLogout,
}: AccountMenuPanelProps) {
  const { theme, toggleTheme } = useThemeMode();
  const isDark = theme === "dark";

  const menuItems: MenuItemType[] = [
    {
      type: "custom",
      id: "account-header",
      content: (
        <div className="px-2 py-2">
          <div className="flex h-10 items-center gap-3">
            <div
              className="flex aspect-square h-full shrink-0 items-center justify-center rounded-full border-2 p-0.5"
              style={{ borderColor: account.borderColor }}
            >
              <div className="h-full w-full overflow-hidden rounded-full bg-amber-200">
                <img
                  className="aspect-square h-full object-cover"
                  src={account.imageUrl}
                  alt={account.name}
                />
              </div>
            </div>
            <div className="flex h-full flex-col justify-between pr-4">
              <span className="app-text-small relative -top-1 block h-2 font-semibold whitespace-nowrap">
                {account.name}
              </span>
              <span
                className="flex items-center justify-center rounded-full border px-0.5 py-px text-[10px] font-bold tracking-[0.04em]"
                style={{
                  color: account.textColor,
                  background: account.bgColor,
                  borderColor: account.borderColor,
                }}
              >
                {account.role}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    { type: "divider", id: "div-1" },
    {
      type: "submenu",
      id: "theme",
      label: "テーマ設定",
      icon: isDark ? MoonStarIcon : SunMediumIcon,
      children: [
        {
          type: "action",
          id: "theme-dark",
          label: "Dark mode",
          icon: MoonStarIcon,
          onClick: () => {
            if (!isDark) toggleTheme();
          },
        },
        {
          type: "action",
          id: "theme-light",
          label: "Light mode",
          icon: SunMediumIcon,
          onClick: () => {
            if (isDark) toggleTheme();
          },
        },
      ],
    },
    {
      type: "action",
      id: "profile",
      label: "プロフィール",
      icon: User2Icon,
      onClick: onClose,
    },
    {
      type: "action",
      id: "settings",
      label: "設定",
      icon: SettingsIcon,
      onClick: onClose,
    },
    { type: "divider", id: "div-2" },
    {
      type: "action",
      id: "logout",
      label: "ログアウト",
      icon: LogOutIcon,
      danger: true,
      onClick: () => {
        onClose();
        onLogout?.();
      },
    },
  ];

  return (
    <div className="absolute top-[calc(100%+6px)] right-0 z-140">
      <Menu items={menuItems} />
    </div>
  );
}

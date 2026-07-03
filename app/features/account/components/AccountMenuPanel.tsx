import {
  LogOutIcon,
  MoonStarIcon,
  SettingsIcon,
  SunMediumIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

import { useThemeMode } from "~/hooks/useThemeMode";
import type { AccountBtnData } from "~/features/account/model/account-btn-data";
import { Menu, type MenuItemType } from "~/components/ui/Menu";
import { AccountProfileHeader } from "~/features/account/components/AccountProfileHeader";

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
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const menuItems: MenuItemType[] = [
    {
      type: "custom",
      id: "account-header",
      content: <AccountProfileHeader account={account} />,
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
      id: "settings",
      label: "設定",
      icon: SettingsIcon,
      onClick: () => {
        onClose();
        navigate("/user/settings");
      },
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

  return <Menu items={menuItems} />;
}

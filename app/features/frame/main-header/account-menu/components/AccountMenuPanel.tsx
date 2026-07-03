import {
  CheckIcon,
  LogOutIcon,
  MonitorIcon,
  MoonStarIcon,
  SettingsIcon,
  SunMediumIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

import { useThemeMode } from "~/hooks/useThemeMode";
import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { Menu, type MenuItemType } from "~/components/ui/Menu";
import { AccountProfileHeader } from "~/features/frame/main-header/account-menu/components/AccountProfileHeader";

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
  const { theme, setTheme } = useThemeMode();
  const navigate = useNavigate();

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
      icon:
        theme === "dark"
          ? MoonStarIcon
          : theme === "light"
            ? SunMediumIcon
            : MonitorIcon,
      children: [
        {
          type: "action",
          id: "theme-light",
          label: "ライト",
          icon: SunMediumIcon,
          endIcon: theme === "light" ? CheckIcon : undefined,
          onClick: () => setTheme("light"),
        },
        {
          type: "action",
          id: "theme-dark",
          label: "ダーク",
          icon: MoonStarIcon,
          endIcon: theme === "dark" ? CheckIcon : undefined,
          onClick: () => setTheme("dark"),
        },
        {
          type: "action",
          id: "theme-system",
          label: "システム",
          icon: MonitorIcon,
          endIcon: theme === "system" ? CheckIcon : undefined,
          onClick: () => setTheme("system"),
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

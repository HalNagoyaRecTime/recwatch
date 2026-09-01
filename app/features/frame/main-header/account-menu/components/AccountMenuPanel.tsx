import {
  CheckIcon,
  ChevronRightIcon,
  LogOutIcon,
  MonitorIcon,
  MoonStarIcon,
  SunMediumIcon,
} from "lucide-react";
import { useState, type PointerEvent } from "react";

import {
  Menu,
  MenuActionItem,
  type MenuItemType,
} from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { cn } from "~/lib/cn";
import { useThemeMode } from "~/hooks/useThemeMode";
import { AccountProfileHeader } from "~/features/frame/main-header/account-menu/components/AccountProfileHeader";
import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AccountMenuPanelProps = {
  account: AccountBtnData;
  photoUrl?: string | null;
  onClose: () => void;
  onLogout?: () => void;
};

export function AccountMenuPanel({
  account,
  photoUrl,
  onClose,
  onLogout,
}: AccountMenuPanelProps) {
  const { theme, setTheme } = useThemeMode();
  const [themeInteraction, setThemeInteraction] = useState<"hover" | "click">(
    "hover"
  );

  const ThemeIcon =
    theme === "dark"
      ? MoonStarIcon
      : theme === "light"
        ? SunMediumIcon
        : MonitorIcon;

  const themeMenuItems: MenuItemType[] = [
    {
      type: "action",
      id: "theme-light",
      label: "ライト",
      icon: SunMediumIcon,
      endIcon: (
        <CheckIcon
          size={14}
          strokeWidth={1.8}
          className={cn(theme !== "light" && "opacity-0")}
        />
      ),
      onClick: () => setTheme("light"),
    },
    {
      type: "action",
      id: "theme-dark",
      label: "ダーク",
      icon: MoonStarIcon,
      endIcon: (
        <CheckIcon
          size={14}
          strokeWidth={1.8}
          className={cn(theme !== "dark" && "opacity-0")}
        />
      ),
      onClick: () => setTheme("dark"),
    },
    {
      type: "action",
      id: "theme-system",
      label: "システム",
      icon: MonitorIcon,
      endIcon: (
        <CheckIcon
          size={14}
          strokeWidth={1.8}
          className={cn(theme !== "system" && "opacity-0")}
        />
      ),
      onClick: () => setTheme("system"),
    },
  ];

  const mainMenuItems: MenuItemType[] = [
    {
      type: "custom",
      id: "account-header",
      content: <AccountProfileHeader account={account} photoUrl={photoUrl} />,
    },
    { type: "divider", id: "div-1" },
    {
      type: "custom",
      id: "theme-switcher",
      content: (
        <FloatingPanel
          placement="right-start"
          interaction={themeInteraction}
          offsetValue={6}
          triggerClassName="block w-full"
          trigger={
            <MenuActionItem
              label="テーマ設定"
              icon={ThemeIcon}
              endIcon={
                <ChevronRightIcon
                  size={14}
                  strokeWidth={1.8}
                  className="text-text-subtle"
                />
              }
              onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                setThemeInteraction(
                  event.pointerType === "mouse" ? "hover" : "click"
                );
              }}
            />
          }
          content={<Menu items={themeMenuItems} />}
        />
      ),
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

  return <Menu items={mainMenuItems} />;
}

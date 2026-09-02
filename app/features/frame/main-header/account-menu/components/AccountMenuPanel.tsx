import {
  CheckIcon,
  ChevronRightIcon,
  LogOutIcon,
  MonitorIcon,
  MoonStarIcon,
  SunMediumIcon,
} from "lucide-react";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";
import type { Placement } from "@floating-ui/react";

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
  focusThemeOnOpen?: boolean;
  themeTriggerRef?: MutableRefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onLogout?: () => void;
};

export function AccountMenuPanel({
  account,
  photoUrl,
  focusThemeOnOpen = false,
  themeTriggerRef: externalThemeTriggerRef,
  onClose,
  onLogout,
}: AccountMenuPanelProps) {
  const { theme, setTheme } = useThemeMode();
  const localThemeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const themeTriggerRef = externalThemeTriggerRef ?? localThemeTriggerRef;
  const logoutRef = useRef<HTMLButtonElement | null>(null);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [themeFocusIndex, setThemeFocusIndex] = useState<number | undefined>();
  const [themeFocusRequest, setThemeFocusRequest] = useState(0);
  const [themePlacement, setThemePlacement] =
    useState<Placement>("right-start");

  const ThemeIcon =
    theme === "dark"
      ? MoonStarIcon
      : theme === "light"
        ? SunMediumIcon
        : MonitorIcon;

  const selectedThemeIndex = theme === "dark" ? 1 : theme === "system" ? 2 : 0;
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
          isOpen={isThemeOpen}
          onOpenChange={(open, _event, reason) => {
            if (!open && reason === "list-navigation") {
              themeTriggerRef.current?.focus();
              return;
            }

            setIsThemeOpen(open);
            if (!open) {
              setThemeFocusIndex(undefined);
            }
          }}
          avoidParentOverlap
          onPlacementChange={setThemePlacement}
          placement="right-start"
          scrollable
          interaction="both"
          offsetValue={2}
          triggerClassName="block w-full"
          trigger={
            <MenuActionItem
              data-menu-item-id="theme-switcher"
              autoFocus={focusThemeOnOpen}
              label="テーマ設定"
              icon={ThemeIcon}
              endIcon={
                <ChevronRightIcon
                  size={14}
                  strokeWidth={1.8}
                  className="text-text-subtle"
                />
              }
              ref={themeTriggerRef}
              onKeyDownCapture={(event: KeyboardEvent<HTMLButtonElement>) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setIsThemeOpen(false);
                  onClose();
                  return;
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  logoutRef.current?.focus();
                  return;
                }

                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                  return;
                }

                event.preventDefault();
                setThemeFocusIndex(selectedThemeIndex);
                setThemeFocusRequest((request) => request + 1);
                setIsThemeOpen(true);
              }}
            />
          }
          content={
            <Menu
              items={themeMenuItems}
              listNavigation
              nested
              rtl={themePlacement.startsWith("left")}
              focusActionIndex={themeFocusIndex}
              focusActionRequest={themeFocusRequest}
            />
          }
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
      ref: logoutRef,
      onKeyDown: (event) => {
        if (event.key !== "ArrowUp") {
          return;
        }

        event.preventDefault();
        themeTriggerRef.current?.focus();
      },
      onClick: () => {
        onClose();
        onLogout?.();
      },
    },
  ];

  return <Menu items={mainMenuItems} />;
}

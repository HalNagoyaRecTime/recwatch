import {
  CheckIcon,
  ChevronRightIcon,
  LogOutIcon,
  MonitorIcon,
  MoonStarIcon,
  SunMediumIcon,
} from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
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
  const lastPointerType = useRef<string | null>(null);
  const themeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const suppressNextThemeFocusOpen = useRef(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [themeInitialFocus, setThemeInitialFocus] = useState(-1);
  const [themeFocusIndex, setThemeFocusIndex] = useState<number | undefined>();
  const [themePlacement, setThemePlacement] =
    useState<Placement>("right-start");
  const [themeInteraction, setThemeInteraction] = useState<"hover" | "click">(
    "hover"
  );

  const ThemeIcon =
    theme === "dark"
      ? MoonStarIcon
      : theme === "light"
        ? SunMediumIcon
        : MonitorIcon;

  const selectedThemeIndex = theme === "dark" ? 1 : theme === "system" ? 2 : 0;
  const themeClosesWithKey = themePlacement.startsWith("left")
    ? "ArrowRight"
    : "ArrowLeft";

  const focusThemeTrigger = () => {
    const trigger =
      themeTriggerRef.current ??
      document.querySelector<HTMLButtonElement>(
        '[data-menu-item-id="theme-switcher"]'
      );
    trigger?.focus();
  };

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
          onOpenChange={(open) => {
            setIsThemeOpen(open);
            if (!open) {
              setThemeInitialFocus(-1);
              setThemeFocusIndex(undefined);
            }
          }}
          avoidParentOverlap
          initialFocus={themeInitialFocus}
          onPlacementChange={setThemePlacement}
          placement="right-start"
          interaction={themeInteraction}
          offsetValue={2}
          triggerClassName="block w-full"
          trigger={
            <MenuActionItem
              data-menu-item-id="theme-switcher"
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
                lastPointerType.current = event.pointerType;
                setThemeInteraction(
                  event.pointerType === "mouse" ? "hover" : "click"
                );
              }}
              onFocusCapture={(event) => {
                themeTriggerRef.current = event.currentTarget;
                if (suppressNextThemeFocusOpen.current) {
                  suppressNextThemeFocusOpen.current = false;
                  lastPointerType.current = null;
                  return;
                }

                if (lastPointerType.current !== "mouse") {
                  setThemeInteraction("click");
                  setThemeInitialFocus(-1);
                  setThemeFocusIndex(undefined);
                  setIsThemeOpen(true);
                }
                lastPointerType.current = null;
              }}
              onKeyDownCapture={(event: KeyboardEvent<HTMLButtonElement>) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setIsThemeOpen(false);
                  onClose();
                  return;
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  event.currentTarget
                    .closest<HTMLElement>("[data-floating-panel]")
                    ?.querySelector<HTMLButtonElement>(
                      '[data-menu-item-id="logout"]'
                    )
                    ?.focus();
                  return;
                }

                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                  return;
                }

                event.preventDefault();
                setThemeInteraction("click");
                setThemeInitialFocus(selectedThemeIndex);
                setThemeFocusIndex(selectedThemeIndex);
                setIsThemeOpen(true);
              }}
            />
          }
          content={
            <Menu
              items={themeMenuItems}
              keyboardNavigation
              focusActionIndex={themeFocusIndex}
              onKeyDown={(event) => {
                if (event.key === themeClosesWithKey) {
                  event.preventDefault();
                  event.stopPropagation();
                  suppressNextThemeFocusOpen.current = true;
                  themeTriggerRef.current?.focus();
                  return;
                }

                if (event.key !== "Escape") {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                suppressNextThemeFocusOpen.current = true;
                setThemeInteraction("hover");
                setIsThemeOpen(false);
                themeTriggerRef.current?.focus();
              }}
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
      onKeyDown: (event) => {
        if (event.key !== "ArrowUp") {
          return;
        }

        event.preventDefault();
        focusThemeTrigger();
      },
      onClick: () => {
        onClose();
        onLogout?.();
      },
    },
  ];

  return <Menu items={mainMenuItems} />;
}

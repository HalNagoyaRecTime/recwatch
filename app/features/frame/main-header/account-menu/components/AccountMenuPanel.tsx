import {
  LogOutIcon,
  MoonStarIcon,
  SettingsIcon,
  SunMediumIcon,
  User2Icon,
} from "lucide-react";

import { MenuActionButton } from "~/components/ui/MenuActionButton";
import { useThemeMode } from "~/hooks/useThemeMode";
import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AccountMenuPanelProps = {
  account: AccountBtnData;
  photoUrl?: string | null;
  onClose: () => void;
  onLogout?: () => void;
};

const accountMenuItems = [
  { icon: User2Icon, label: "Profile" },
  { icon: SettingsIcon, label: "Settings" },
];

export function AccountMenuPanel({
  account,
  photoUrl,
  onClose,
  onLogout,
}: AccountMenuPanelProps) {
  const { theme, toggleTheme } = useThemeMode();
  const isDark = theme === "dark";

  return (
    <div className="absolute top-[calc(100%+6px)] right-0 z-140 rounded-xl border border-(--border-2) bg-(--surface-overlay-strong) p-2 shadow-(--shadow-soft) backdrop-blur-xl">
      <div className="px-2 py-2">
        <div className="flex h-10 items-center gap-3">
          {/* アカウントの画像 */}
          <div
            className="flex aspect-square h-full shrink-0 items-center justify-center rounded-full border-2 p-0.5"
            style={{ borderColor: account.borderColor }}
          >
            {photoUrl ? (
              <img
                className="h-full w-full rounded-full object-cover"
                src={photoUrl}
                alt=""
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-full text-xs font-bold"
                style={{
                  color: account.textColor,
                  background: account.bgColor,
                }}
                aria-hidden="true"
              >
                {account.abbr_label}
              </div>
            )}
          </div>
          {/* 右側名前とロール */}
          <div className="flex h-full flex-col justify-between pr-4">
            <span className="app-text-small relative -top-1 block h-2 font-semibold whitespace-nowrap">
              {account.name}
            </span>
            <span
              className="flex w-fit items-center justify-center rounded-full border px-2 py-px text-[10px] font-bold tracking-[0.04em]"
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

      {/* 棒 */}
      <div className="mx-1 my-1.5 h-px bg-(--border-1)" />

      {/* ここにライトモードダークモード切り替えボタン */}
      <MenuActionButton
        content={
          <>
            {isDark ? (
              <MoonStarIcon size={14} strokeWidth={1.8} />
            ) : (
              <SunMediumIcon size={14} strokeWidth={1.8} />
            )}
            <span className="app-text-small">
              {isDark ? "Light mode" : "Dark mode"}
            </span>
          </>
        }
        onClick={toggleTheme}
      />

      <div className="">
        {accountMenuItems.map(({ icon: Icon, label }) => (
          <MenuActionButton
            key={label}
            content={
              <>
                <Icon size={14} strokeWidth={1.8} />
                <span className="app-text-small">{label}</span>
              </>
            }
            onClick={onClose}
          />
        ))}
        {/* 棒 */}
        <div className="mx-1 my-1.5 h-px bg-(--border-1)" />
        {/* ログアウト */}
        <button
          type="button"
          className="flex h-8.5 w-full cursor-pointer items-center gap-2.5 rounded-md bg-transparent px-2.5 text-left text-sm transition hover:bg-red-500/5"
          onClick={() => {
            onClose();
            onLogout?.();
          }}
        >
          <LogOutIcon className="text-red-400" size={14} strokeWidth={1.8} />
          <span className="app-text-small text-red-400">Log out</span>
        </button>
      </div>
    </div>
  );
}

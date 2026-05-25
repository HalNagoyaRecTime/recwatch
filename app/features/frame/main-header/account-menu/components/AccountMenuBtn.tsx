import { ChevronDownIcon } from "lucide-react";

import { cn } from "~/lib/cn";

import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AccountMenuBtnProps = {
  account: AccountBtnData;
  photoUrl?: string | null;
  isOpen: boolean;
  onToggle: () => void;
};

export function AccountMenuBtn({
  account,
  photoUrl,
  isOpen,
  onToggle,
}: AccountMenuBtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "app-rounded relative flex h-full cursor-pointer items-center gap-2 overflow-hidden rounded-l-[20px]! bg-transparent text-(--text-1) transition",
        "hover:border-(--border-strong) hover:bg-(--surface-2)",
        isOpen ? "bg-(--surface-2)" : ""
      )}
      onClick={onToggle}
    >
      {/* 背景とボーダー描画用div */}
      <div
        className={cn(
          "app-rounded absolute z-10 h-full w-full border",
          "border-(--border-2)",
          isOpen ? "border-(--border-strong)" : ""
        )}
      ></div>
      {/* ユーザー */}
      <div
        className="absolute z-20 aspect-square h-full rounded-full border-2 p-0.5"
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
            className="flex h-full w-full items-center justify-center rounded-full text-[10px] font-bold"
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

      <span className="z-15 pr-2 pl-9 text-xs font-semibold">
        {account.name}
      </span>
      <ChevronDownIcon
        size={14}
        strokeWidth={1.8}
        className="mr-2 text-(--text-3)"
      />
    </button>
  );
}

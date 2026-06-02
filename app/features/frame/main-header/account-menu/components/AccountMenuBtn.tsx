import { ChevronDownIcon } from "lucide-react";

import { cn } from "~/lib/cn";

import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AccountMenuBtnProps = {
  account: AccountBtnData;
  isOpen: boolean;
  onToggle: () => void;
};

export function AccountMenuBtn({
  account,
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
        <div className="h-full w-full overflow-hidden rounded-full bg-amber-200">
          <img
            className="aspect-square h-full object-cover"
            src={account.imageUrl}
            alt={account.name}
          />
        </div>
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

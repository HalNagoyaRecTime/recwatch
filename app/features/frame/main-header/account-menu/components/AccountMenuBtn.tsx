import { ChevronDownIcon } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "~/lib/cn";
import { AccountAvatar } from "~/features/frame/main-header/account-menu/components/AccountAvatar";
import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AccountMenuBtnProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "type"
> & {
  account: AccountBtnData;
  photoUrl?: string | null;
  isOpen: boolean;
};

export const AccountMenuBtn = forwardRef<
  HTMLButtonElement,
  AccountMenuBtnProps
>(function AccountMenuBtn(
  { account, photoUrl, isOpen, className, ...buttonProps },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      {...buttonProps}
      className={cn(
        "app-rounded text-text-base relative flex h-full cursor-pointer items-center gap-2 overflow-hidden rounded-l-[20px]! bg-transparent transition",
        "hover:border-border-strong hover:bg-surface-hover",
        isOpen ? "bg-surface-hover" : "",
        className
      )}
    >
      <div
        className={cn(
          "app-rounded absolute z-10 h-full w-full border",
          "border-border-base",
          isOpen ? "border-border-strong" : ""
        )}
      />

      <AccountAvatar
        account={account}
        photoUrl={photoUrl}
        className="absolute z-20"
      />

      <span className="text-text-base z-15 pl-9 text-xs font-semibold whitespace-nowrap">
        {account.name}
      </span>
      <ChevronDownIcon
        size={14}
        strokeWidth={1.8}
        className="text-text-subtle z-15 mr-2 shrink-0"
      />
    </button>
  );
});

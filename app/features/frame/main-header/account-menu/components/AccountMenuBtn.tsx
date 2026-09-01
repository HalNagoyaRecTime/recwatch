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
        "app-rounded text-text-base relative flex h-full w-8 shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full! bg-transparent transition md:w-auto md:max-w-40 md:justify-start md:rounded-l-[20px]! md:rounded-r-[8px]!",
        "hover:border-border-strong hover:bg-surface-hover",
        isOpen ? "bg-surface-hover" : "",
        className
      )}
    >
      <div
        className={cn(
          "absolute z-10 h-full w-full rounded-full! border md:rounded-[8px]!",
          "border-border-base",
          isOpen ? "border-border-strong" : ""
        )}
      />

      <AccountAvatar
        account={account}
        photoUrl={photoUrl}
        className="absolute z-20"
      />

      <span className="text-text-base z-15 hidden max-w-32 min-w-0 truncate pl-9 text-xs font-semibold md:block">
        {account.name}
      </span>
      <ChevronDownIcon
        size={14}
        strokeWidth={1.8}
        className="text-text-subtle z-15 mr-2 hidden shrink-0 md:block"
      />
    </button>
  );
});

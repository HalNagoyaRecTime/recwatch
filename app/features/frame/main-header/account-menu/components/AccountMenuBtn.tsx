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
        "border-border-base text-text-base relative flex h-full w-8 shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border bg-transparent transition-colors md:w-fit md:min-w-0 md:shrink md:justify-start md:rounded-l-[20px] md:rounded-r-[8px]",
        "hover:border-border-strong hover:bg-surface-hover",
        isOpen ? "border-border-strong bg-surface-hover" : "",
        className
      )}
    >
      <AccountAvatar
        account={account}
        photoUrl={photoUrl}
        className="absolute z-20"
      />

      <span className="text-text-base z-15 max-w-0 min-w-0 shrink truncate overflow-hidden p-0 text-xs font-semibold opacity-0 transition-opacity duration-200 ease-out md:max-w-none md:pl-9 md:opacity-100">
        {account.name}
      </span>
      <ChevronDownIcon
        size={14}
        strokeWidth={1.8}
        className="text-text-subtle z-15 mr-0 max-w-0 overflow-hidden opacity-0 transition-opacity duration-200 ease-out md:mr-2 md:max-w-[14px] md:shrink-0 md:opacity-100"
      />
    </button>
  );
});

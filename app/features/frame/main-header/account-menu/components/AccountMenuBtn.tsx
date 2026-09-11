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
  {
    account,
    photoUrl,
    isOpen,
    className,
    "aria-label": ariaLabel,
    ...buttonProps
  },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      {...buttonProps}
      aria-label={ariaLabel ?? "アカウントメニュー"}
      className={cn(
        "text-text-base relative flex h-full w-8 shrink-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-full bg-transparent transition-colors md:w-fit md:min-w-0 md:shrink md:justify-start md:rounded-l-[20px] md:rounded-r-[8px]",
        "before:border-border-base before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-full before:border before:transition-colors before:duration-150 md:before:rounded-l-[20px] md:before:rounded-r-[8px]",
        "hover:bg-surface-hover hover:before:border-border-strong",
        isOpen ? "bg-surface-hover" : "",
        isOpen ? "before:border-border-strong" : "",
        className
      )}
    >
      <AccountAvatar
        account={account}
        photoUrl={photoUrl}
        className="absolute z-20"
      />

      <span className="text-text-base z-15 hidden min-w-0 truncate text-xs font-semibold md:block md:pl-9">
        {account.name}
      </span>
      <ChevronDownIcon
        size={14}
        strokeWidth={1.8}
        aria-hidden="true"
        className="text-text-subtle z-15 mr-0 hidden shrink-0 md:mr-2 md:block"
      />
    </button>
  );
});

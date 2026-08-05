import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { AccountAvatar } from "~/features/frame/main-header/account-menu/components/AccountAvatar";

type AccountProfileHeaderProps = {
  account: AccountBtnData;
  photoUrl?: string | null;
};

export function AccountProfileHeader({
  account,
  photoUrl,
}: AccountProfileHeaderProps) {
  return (
    <div className="px-2 py-2">
      <div className="flex h-10 items-center gap-3">
        <AccountAvatar account={account} photoUrl={photoUrl} />
        <div className="flex h-full flex-col justify-between pr-4">
          <span className="app-text-small text-text-base relative -top-1 block h-2 font-semibold whitespace-nowrap">
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
  );
}

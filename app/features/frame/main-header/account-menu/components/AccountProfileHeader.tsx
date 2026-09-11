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
    <div className="p-2">
      <div className="flex h-10 min-w-0 items-center gap-3">
        <AccountAvatar account={account} photoUrl={photoUrl} />
        <div className="flex h-full min-w-0 flex-1 flex-col justify-between pr-1">
          <span className="app-text-small text-text-base relative -top-1 block max-w-full min-w-0 truncate font-semibold whitespace-nowrap">
            {account.name}
          </span>
          {/* 未実装ロール機能のためコメントアウト */}
          {/*<span*/}
          {/*  className="flex w-fit items-center justify-center rounded-full border px-2 py-px text-[10px] font-bold tracking-[0.04em]"*/}
          {/*  style={{*/}
          {/*    color: account.textColor,*/}
          {/*    background: account.bgColor,*/}
          {/*    borderColor: account.borderColor,*/}
          {/*  }}*/}
          {/*>*/}
          {/*  {account.role}*/}
          {/*</span>*/}
        </div>
      </div>
    </div>
  );
}

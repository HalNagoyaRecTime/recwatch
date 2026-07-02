import type { AccountBtnData } from "~/features/account/model/account-btn-data";

type AccountProfileHeaderProps = {
  account: AccountBtnData;
};

export function AccountProfileHeader({ account }: AccountProfileHeaderProps) {
  return (
    <div className="px-2 py-2">
      <div className="flex h-10 items-center gap-3">
        <div
          className="flex aspect-square h-full shrink-0 items-center justify-center rounded-full border-2 p-0.5"
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
        <div className="flex h-full flex-col justify-between pr-4">
          <span className="app-text-small relative -top-1 block h-2 font-semibold whitespace-nowrap">
            {account.name}
          </span>
          <span
            className="flex items-center justify-center rounded-full border px-0.5 py-px text-[10px] font-bold tracking-[0.04em]"
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

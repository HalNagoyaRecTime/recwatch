import type { AccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { cn } from "~/lib/cn";

type AccountAvatarProps = {
  account: AccountBtnData;
  photoUrl?: string | null;
  className?: string;
};

export function AccountAvatar({
  account,
  photoUrl,
  className,
}: AccountAvatarProps) {
  const imageSrc = photoUrl || account.imageUrl;

  return (
    <div
      className={cn(
        "aspect-square h-full shrink-0 rounded-full border-2 p-0.5",
        className
      )}
      style={{ borderColor: account.borderColor }}
    >
      {imageSrc ? (
        <img
          className="h-full w-full rounded-full object-cover"
          src={imageSrc}
          alt={account.name}
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
  );
}

import { AccountMenuBtn } from "~/features/frame/main-header/account-menu/components/AccountMenuBtn";
import { AccountMenuPanel } from "~/features/frame/main-header/account-menu/components/AccountMenuPanel";
import {
  getAccountBtnData,
  type AccountUser,
} from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { useAccountBtn } from "~/features/frame/main-header/account-menu/hooks/useAccountBtn";
import { useAccountPhoto } from "~/features/frame/main-header/account-menu/hooks/useAccountPhoto";

type AccountBtnProps = {
  user?: AccountUser | null;
  onLogout?: () => void;
};

export function AccountBtn({ user, onLogout }: AccountBtnProps) {
  const account = getAccountBtnData(user);
  const photoUrl = useAccountPhoto(user);
  const { close, isOpen, rootRef, toggle } = useAccountBtn();

  return (
    <div className="relative" ref={rootRef}>
      <AccountMenuBtn
        account={account}
        photoUrl={photoUrl}
        isOpen={isOpen}
        onToggle={toggle}
      />
      {isOpen ? (
        <AccountMenuPanel
          account={account}
          photoUrl={photoUrl}
          onClose={close}
          onLogout={onLogout}
        />
      ) : null}
    </div>
  );
}

import { AccountMenuBtn } from "~/features/frame/main-header/account-menu/components/AccountMenuBtn";
import { AccountMenuPanel } from "~/features/frame/main-header/account-menu/components/AccountMenuPanel";
import { getAccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { useAccountBtn } from "~/features/frame/main-header/account-menu/hooks/useAccountBtn";

type AccountBtnProps = {
  onLogout?: () => void;
};

export function AccountBtn({ onLogout }: AccountBtnProps) {
  const account = getAccountBtnData();
  const { close, isOpen, rootRef, toggle } = useAccountBtn();

  return (
    <div className="relative" ref={rootRef}>
      <AccountMenuBtn account={account} isOpen={isOpen} onToggle={toggle} />
      {isOpen ? (
        <AccountMenuPanel
          account={account}
          onClose={close}
          onLogout={onLogout}
        />
      ) : null}
    </div>
  );
}

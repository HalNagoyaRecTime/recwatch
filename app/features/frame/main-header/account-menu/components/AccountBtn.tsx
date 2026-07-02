import { AccountMenuBtn } from "~/features/frame/main-header/account-menu/components/AccountMenuBtn";
import { AccountMenuPanel } from "~/features/frame/main-header/account-menu/components/AccountMenuPanel";
import { getAccountBtnData } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { useState } from "react";
import { Popover } from "~/components/shared/Popover";

type AccountBtnProps = {
  onLogout?: () => void;
};

export function AccountBtn({ onLogout }: AccountBtnProps) {
  const account = getAccountBtnData();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      interaction="click"
      trigger={
        <AccountMenuBtn
          account={account}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
      }
      content={
        <AccountMenuPanel
          account={account}
          onClose={() => setIsOpen(false)}
          onLogout={onLogout}
        />
      }
    />
  );
}

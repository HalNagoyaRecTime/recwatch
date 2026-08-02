import { useState } from "react";
import { FloatingTree } from "@floating-ui/react";

import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { AccountMenuBtn } from "~/features/frame/main-header/account-menu/components/AccountMenuBtn";
import { AccountMenuPanel } from "~/features/frame/main-header/account-menu/components/AccountMenuPanel";
import { useAccountPhoto } from "~/features/frame/main-header/account-menu/hooks/useAccountPhoto";
import {
  getAccountBtnData,
  type AccountUser,
} from "~/features/frame/main-header/account-menu/model/account-btn-data";

type AccountBtnProps = {
  user?: AccountUser | null;
  onLogout?: () => void;
};

export function AccountBtn({ user, onLogout }: AccountBtnProps) {
  const account = getAccountBtnData(user);
  const photoUrl = useAccountPhoto(user);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FloatingTree>
      <FloatingPanel
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-end"
        interaction="click"
        trigger={
          <AccountMenuBtn
            account={account}
            photoUrl={photoUrl}
            isOpen={isOpen}
          />
        }
        content={
          <AccountMenuPanel
            account={account}
            photoUrl={photoUrl}
            onClose={() => setIsOpen(false)}
            onLogout={onLogout}
          />
        }
      />
    </FloatingTree>
  );
}

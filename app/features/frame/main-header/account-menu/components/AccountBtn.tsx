import { useEffect, useRef, useState } from "react";
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
  const focusThemeOnOpen = useRef(false);

  const focusThemeTrigger = () => {
    document
      .querySelector<HTMLButtonElement>('[data-menu-item-id="theme-switcher"]')
      ?.focus();
  };

  useEffect(() => {
    if (!isOpen || !focusThemeOnOpen.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      focusThemeOnOpen.current = false;
      focusThemeTrigger();
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

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
            onKeyDownCapture={(event) => {
              if (event.key !== "ArrowDown") {
                return;
              }

              event.preventDefault();
              focusThemeOnOpen.current = true;
              if (isOpen) {
                focusThemeTrigger();
              } else {
                setIsOpen(true);
              }
            }}
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

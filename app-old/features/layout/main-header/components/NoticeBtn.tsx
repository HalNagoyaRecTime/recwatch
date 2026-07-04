import { useState } from "react";
import { Popover } from "~/components/shared/Popover";
import { NoticeMenuBtn } from "~/features/layout/main-header/components/NoticeMenuBtn";
import { NoticeMenuPanel } from "~/features/layout/main-header/components/NoticeMenuPanel";

export function NoticeBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = 3; // テスト用

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      interaction="click"
      trigger={
        <NoticeMenuBtn
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
          unreadCount={unreadCount}
        />
      }
      content={<NoticeMenuPanel onClose={() => setIsOpen(false)} />}
    />
  );
}

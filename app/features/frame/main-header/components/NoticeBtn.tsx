import { cn } from "~/lib/cn";
import { BellIcon } from "lucide-react";
import { useState } from "react";

import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { AppNotificationCenter } from "~/features/frame/feedback/components/AppNotificationCenter";
import { useFeedback } from "~/features/frame/feedback/hooks/useFeedback";

export function NoticeBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useFeedback();

  return (
    <FloatingPanel
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      interaction="click"
      offsetValue={6}
      scrollable
      trigger={
        <button
          type="button"
          className={cn(
            "app-rounded shadow-soft relative inline-flex aspect-square h-full cursor-pointer items-center justify-center border transition",
            "border-border-base text-text-muted bg-transparent",
            "hover:border-border-strong hover:bg-surface-hover hover:text-text-base"
          )}
          aria-label="通知"
        >
          <BellIcon aria-hidden="true" size={15} strokeWidth={1.8} />
          {unreadCount > 0 ? (
            <span
              className="border-surface-base bg-brand-primary text-text-base absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] px-1 text-[10px] leading-none font-semibold"
              aria-label={`${unreadCount > 99 ? "99+" : unreadCount}件の未読通知`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      }
      content={<AppNotificationCenter />}
    />
  );
}

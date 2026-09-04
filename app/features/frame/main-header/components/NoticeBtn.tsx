import { cn } from "~/lib/cn";
import { BellIcon } from "lucide-react";
import { useRef, useState } from "react";

import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { AppNotificationCenter } from "~/features/frame/feedback/components/AppNotificationCenter";
import { useFeedback } from "~/features/frame/feedback/hooks/useFeedback";

export function NoticeBtn() {
  const [manualOpen, setManualOpen] = useState(false);
  const {
    unreadCount,
    notificationCenterRequest,
    clearNotificationCenterRequest,
    markRead,
  } = useFeedback();
  const isOpen = manualOpen || notificationCenterRequest !== null;
  const bellRef = useRef<HTMLButtonElement>(null);
  const focusFirstNotificationRef = useRef<(() => void) | null>(null);
  const focusFirstWhenReadyRef = useRef(false);
  const initialNotificationId =
    notificationCenterRequest?.notificationId ?? null;

  const handleOpenChange = (open: boolean) => {
    setManualOpen(open);
    if (!open) {
      focusFirstWhenReadyRef.current = false;
      if (notificationCenterRequest) {
        markRead(notificationCenterRequest.notificationId);
      }
      clearNotificationCenterRequest();
    }
  };

  return (
    <FloatingPanel
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
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
          ref={bellRef}
          aria-label={`通知${unreadCount > 0 ? `、${unreadCount > 99 ? "99+" : unreadCount}件の未読通知` : ""}`}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            if (isOpen) {
              focusFirstNotificationRef.current?.();
            } else {
              focusFirstWhenReadyRef.current = true;
              setManualOpen(true);
            }
          }}
        >
          <BellIcon aria-hidden="true" size={15} strokeWidth={1.8} />
          {unreadCount > 0 ? (
            <span
              className="border-surface-base bg-brand-primary text-text-base absolute -top-[1px] right-[1px] flex size-3.5 items-center justify-center rounded-full border-[1.5px] p-0 text-[4px] leading-none font-semibold"
              aria-hidden="true"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      }
      content={
        <AppNotificationCenter
          key={notificationCenterRequest?.requestId ?? "notification-center"}
          initialNotificationId={initialNotificationId}
          onFocusTrigger={() => bellRef.current?.focus()}
          onRegisterFocusFirst={(focusFirst) => {
            focusFirstNotificationRef.current = focusFirst;
            if (focusFirstWhenReadyRef.current) {
              focusFirstWhenReadyRef.current = false;
              focusFirst();
            }
            return () => {
              focusFirstNotificationRef.current = null;
            };
          }}
        />
      }
    />
  );
}

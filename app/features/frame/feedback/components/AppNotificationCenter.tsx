import { Trash2Icon } from "lucide-react";
import { useCallback, useEffect } from "react";

import { useFeedback } from "../hooks/useFeedback";
import { useAppNotificationListNavigation } from "../hooks/useAppNotificationListNavigation";
import { useAppNotificationReadTracking } from "../hooks/useAppNotificationReadTracking";
import { FloatingListSurface } from "~/components/ui/panel/FloatingListSurface";
import { Button } from "~/components/ui/button/Button";
import { AppNotificationRow } from "./AppNotificationRow";

export function AppNotificationCenter({
  onFocusTrigger,
  onRegisterFocusFirst,
  initialNotificationId,
}: {
  onFocusTrigger?: () => void;
  onRegisterFocusFirst?: (focusFirst: () => void) => () => void;
  initialNotificationId?: string | null;
}) {
  const { notifications, markRead, removeNotification, clearNotifications } =
    useFeedback();
  const { registerRow } = useAppNotificationReadTracking({
    notifications,
    initialNotificationId,
    onRead: markRead,
  });
  const {
    registerMessage,
    focusNotification,
    focusFirst,
    handleMessageKeyDown,
    handleActionKeyDown,
    handleHeaderKeyDown,
    requestFocusAfterDelete,
  } = useAppNotificationListNavigation({ notifications, onFocusTrigger });

  useEffect(() => {
    if (!onRegisterFocusFirst) return;
    return onRegisterFocusFirst(focusFirst);
  }, [focusFirst, onRegisterFocusFirst]);

  const handleRemove = useCallback(
    (id: string) => {
      requestFocusAfterDelete(id);
      removeNotification(id);
    },
    [removeNotification, requestFocusAfterDelete]
  );

  return (
    <div className="w-[min(20rem,calc(100vw-1rem))]">
      <FloatingListSurface
        scrollable
        scrollTabIndex={-1}
        style={{
          maxHeight: "min(55vh, var(--floating-panel-available-height))",
        }}
        fixedHeader={
          <div className="border-border-subtle bg-surface-base mx-2 flex items-center justify-between gap-3 border-b px-2.5 py-2">
            <h2 className="text-text-base text-[15px] font-semibold">通知</h2>
            <Button
              icon={Trash2Icon}
              iconOnly
              size="sm"
              variant="ghost"
              onClick={clearNotifications}
              onKeyDown={handleHeaderKeyDown}
              disabled={notifications.length === 0}
              aria-label="すべて削除"
            />
          </div>
        }
      >
        {notifications.length === 0 ? (
          <p className="text-text-muted px-2.5 py-6 text-center text-sm">
            通知はありません
          </p>
        ) : (
          <ul className="flex flex-col gap-1" aria-label="通知一覧">
            {notifications.map((notification) => (
              <AppNotificationRow
                key={notification.id}
                notification={notification}
                initiallyExpanded={notification.id === initialNotificationId}
                registerRow={registerRow}
                registerMessage={registerMessage}
                onRead={() => markRead(notification.id)}
                onRemove={() => handleRemove(notification.id)}
                focusNotification={focusNotification}
                handleMessageKeyDown={handleMessageKeyDown}
                handleActionKeyDown={handleActionKeyDown}
              />
            ))}
          </ul>
        )}
      </FloatingListSurface>
    </div>
  );
}

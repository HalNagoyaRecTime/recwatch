import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";

import type { AppNotification } from "../model/app-notification";

type UseAppNotificationListNavigationOptions = {
  notifications: AppNotification[];
  onFocusTrigger?: () => void;
};

export function useAppNotificationListNavigation({
  notifications,
  onFocusTrigger,
}: UseAppNotificationListNavigationOptions) {
  const messageRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocusIdRef = useRef<string | undefined>(undefined);
  const pendingFocusRequestedRef = useRef(false);

  const registerMessage = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      if (node) {
        messageRefs.current.set(id, node);
      } else {
        messageRefs.current.delete(id);
      }
    },
    []
  );

  const focusNotification = useCallback((id: string) => {
    const node = messageRefs.current.get(id);
    if (!node) return;
    node.focus({ preventScroll: true });
    node.scrollIntoView?.({ block: "nearest" });
  }, []);

  const focusNotificationAt = useCallback(
    (index: number) => {
      const notification = notifications[index];
      if (notification) focusNotification(notification.id);
    },
    [focusNotification, notifications]
  );

  const focusFirst = useCallback(() => {
    focusNotificationAt(0);
  }, [focusNotificationAt]);

  const handleMessageKeyDown = useCallback(
    (id: string, event: KeyboardEvent<HTMLButtonElement>) => {
      const index = notifications.findIndex(
        (notification) => notification.id === id
      );
      if (index < 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (index + 1 < notifications.length) {
          focusNotificationAt(index + 1);
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (index === 0) {
          onFocusTrigger?.();
        } else {
          focusNotificationAt(index - 1);
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        focusFirst();
      } else if (event.key === "End") {
        event.preventDefault();
        focusNotificationAt(notifications.length - 1);
      }
    },
    [focusFirst, focusNotificationAt, notifications, onFocusTrigger]
  );

  const handleActionKeyDown = useCallback(
    (id: string, event: KeyboardEvent<HTMLElement>) => {
      const index = notifications.findIndex(
        (notification) => notification.id === id
      );
      if (index < 0) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusNotification(id);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (index + 1 < notifications.length) {
          focusNotificationAt(index + 1);
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (index === 0) {
          onFocusTrigger?.();
        } else {
          focusNotificationAt(index - 1);
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        focusFirst();
      } else if (event.key === "End") {
        event.preventDefault();
        focusNotificationAt(notifications.length - 1);
      }
    },
    [
      focusFirst,
      focusNotification,
      focusNotificationAt,
      notifications,
      onFocusTrigger,
    ]
  );

  const requestFocusAfterDelete = useCallback(
    (id: string) => {
      const index = notifications.findIndex(
        (notification) => notification.id === id
      );
      pendingFocusIdRef.current =
        notifications[index + 1]?.id ?? notifications[index - 1]?.id;
      pendingFocusRequestedRef.current = true;
    },
    [notifications]
  );

  useEffect(() => {
    if (!pendingFocusRequestedRef.current) return;
    pendingFocusRequestedRef.current = false;
    const pendingId = pendingFocusIdRef.current;
    pendingFocusIdRef.current = undefined;
    if (pendingId && notifications.some(({ id }) => id === pendingId)) {
      focusNotification(pendingId);
    } else {
      onFocusTrigger?.();
    }
  }, [focusNotification, notifications, onFocusTrigger]);

  const handleHeaderKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      focusFirst();
    },
    [focusFirst]
  );

  return {
    registerMessage,
    focusNotification,
    focusNotificationAt,
    focusFirst,
    handleMessageKeyDown,
    handleActionKeyDown,
    handleHeaderKeyDown,
    requestFocusAfterDelete,
  };
}

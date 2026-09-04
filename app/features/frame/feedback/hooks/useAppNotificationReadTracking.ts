import { useCallback, useEffect, useRef } from "react";

import type { AppNotification } from "../model/app-notification";

export const APP_NOTIFICATION_VISIBILITY_THRESHOLD = 0.5;
export const APP_NOTIFICATION_VISIBILITY_DELAY_MS = 400;

type UseAppNotificationReadTrackingOptions = {
  notifications: AppNotification[];
  initialNotificationId?: string | null;
  onRead: (id: string) => void;
};

export function useAppNotificationReadTracking({
  notifications,
  initialNotificationId,
  onRead,
}: UseAppNotificationReadTrackingOptions) {
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const visibilityTimersRef = useRef(new Map<string, number>());

  const registerRow = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) {
      rowRefs.current.set(id, node);
    } else {
      rowRefs.current.delete(id);
    }
  }, []);

  const unreadNotificationIdsKey = notifications
    .filter((notification) => !notification.read)
    .map((notification) => notification.id)
    .sort()
    .join("\u0000");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const unreadIds = new Set(
      unreadNotificationIdsKey ? unreadNotificationIdsKey.split("\u0000") : []
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.notificationId;
          if (!id || !unreadIds.has(id) || id === initialNotificationId) {
            observer.unobserve(entry.target);
            continue;
          }

          const timer = visibilityTimersRef.current.get(id);
          const isVisible =
            entry.isIntersecting &&
            entry.intersectionRatio >= APP_NOTIFICATION_VISIBILITY_THRESHOLD;

          if (isVisible && timer === undefined) {
            visibilityTimersRef.current.set(
              id,
              window.setTimeout(() => {
                onRead(id);
                visibilityTimersRef.current.delete(id);
                observer.unobserve(entry.target);
              }, APP_NOTIFICATION_VISIBILITY_DELAY_MS)
            );
          } else if (!isVisible && timer !== undefined) {
            window.clearTimeout(timer);
            visibilityTimersRef.current.delete(id);
          }
        }
      },
      { threshold: APP_NOTIFICATION_VISIBILITY_THRESHOLD }
    );

    rowRefs.current.forEach((node, id) => {
      if (unreadIds.has(id)) observer.observe(node);
    });

    const visibilityTimers = visibilityTimersRef.current;
    return () => {
      observer.disconnect();
      visibilityTimers.forEach((timer) => window.clearTimeout(timer));
      visibilityTimers.clear();
    };
  }, [initialNotificationId, onRead, unreadNotificationIdsKey]);

  return { registerRow };
}

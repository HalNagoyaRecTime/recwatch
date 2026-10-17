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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const unreadIdsRef = useRef<Set<string>>(new Set());
  const initialNotificationIdRef = useRef(initialNotificationId);
  const onReadRef = useRef(onRead);

  const clearVisibilityTimer = useCallback((id: string) => {
    const timer = visibilityTimersRef.current.get(id);
    if (timer === undefined) return;
    window.clearTimeout(timer);
    visibilityTimersRef.current.delete(id);
  }, []);

  const registerRow = useCallback((id: string, node: HTMLLIElement | null) => {
    const observer = observerRef.current;
    const previousNode = rowRefs.current.get(id);
    if (previousNode && previousNode !== node) {
      observer?.unobserve(previousNode);
    }

    if (!node) {
      rowRefs.current.delete(id);
      return;
    }

    rowRefs.current.set(id, node);
    if (
      observer &&
      unreadIdsRef.current.has(id) &&
      id !== initialNotificationIdRef.current
    ) {
      observer.observe(node);
    }
  }, []);

  useEffect(() => {
    unreadIdsRef.current = new Set(
      notifications
        .filter((notification) => !notification.read)
        .map((notification) => notification.id)
    );
  }, [notifications]);

  useEffect(() => {
    initialNotificationIdRef.current = initialNotificationId;
  }, [initialNotificationId]);

  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.notificationId;
          if (
            !id ||
            !unreadIdsRef.current.has(id) ||
            id === initialNotificationIdRef.current
          ) {
            observer.unobserve(entry.target);
            if (id) clearVisibilityTimer(id);
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
                visibilityTimersRef.current.delete(id);
                observer.unobserve(entry.target);
                if (
                  unreadIdsRef.current.has(id) &&
                  id !== initialNotificationIdRef.current
                ) {
                  onReadRef.current(id);
                }
              }, APP_NOTIFICATION_VISIBILITY_DELAY_MS)
            );
          } else if (!isVisible && timer !== undefined) {
            clearVisibilityTimer(id);
          }
        }
      },
      { threshold: APP_NOTIFICATION_VISIBILITY_THRESHOLD }
    );
    observerRef.current = observer;

    rowRefs.current.forEach((node, id) => {
      if (
        unreadIdsRef.current.has(id) &&
        id !== initialNotificationIdRef.current
      ) {
        observer.observe(node);
      }
    });

    const visibilityTimers = visibilityTimersRef.current;
    return () => {
      observerRef.current = null;
      observer.disconnect();
      visibilityTimers.forEach((timer) => window.clearTimeout(timer));
      visibilityTimers.clear();
    };
  }, [clearVisibilityTimer]);

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    const activeIds = new Set(
      notifications.map((notification) => notification.id)
    );
    visibilityTimersRef.current.forEach((_, id) => {
      if (!activeIds.has(id)) clearVisibilityTimer(id);
    });

    rowRefs.current.forEach((node, id) => {
      if (
        unreadIdsRef.current.has(id) &&
        id !== initialNotificationIdRef.current
      ) {
        observer.observe(node);
      } else {
        observer.unobserve(node);
        clearVisibilityTimer(id);
      }
    });
  }, [clearVisibilityTimer, initialNotificationId, notifications]);

  return { registerRow };
}

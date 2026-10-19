import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FeedbackContext } from "./FeedbackContext";
import { getFeedbackPolicy } from "../application/feedback-policy";
import {
  APP_NOTIFICATION_MAX_COUNT,
  APP_NOTIFICATION_RETENTION_MS,
  getAppNotificationStorageKey,
  type AppNotification,
  type FeedbackContextValue,
  type FeedbackDiagnostic,
  type FeedbackInput,
} from "../model/app-notification";

const feedbackKinds = new Set([
  "validation",
  "action-success",
  "action-error",
  "background-success",
  "background-error",
  "system-warning",
  "system-error",
  "info",
]);
const feedbackSeverities = new Set(["info", "success", "warning", "error"]);

function cleanupNotifications(
  notifications: AppNotification[],
  now = Date.now()
): AppNotification[] {
  const retained = notifications.filter((notification) => {
    const createdAt = Date.parse(notification.createdAt);
    return (
      Number.isFinite(createdAt) &&
      now - createdAt <= APP_NOTIFICATION_RETENTION_MS
    );
  });

  return retained
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, APP_NOTIFICATION_MAX_COUNT);
}

function isFeedbackNotification(value: unknown): value is AppNotification {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AppNotification>;
  return (
    typeof item.id === "string" &&
    typeof item.kind === "string" &&
    feedbackKinds.has(item.kind) &&
    typeof item.severity === "string" &&
    feedbackSeverities.has(item.severity) &&
    typeof item.title === "string" &&
    typeof item.message === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.read === "boolean"
  );
}

function readNotifications(userId: string | null): AppNotification[] {
  if (typeof window === "undefined") return [];
  if (!userId) return [];

  try {
    const raw = window.localStorage.getItem(
      getAppNotificationStorageKey(userId)
    );
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return cleanupNotifications(
      parsed.filter(isFeedbackNotification).map((notification) => ({
        ...notification,
        diagnostic: safeDiagnostic(notification.diagnostic),
      }))
    );
  } catch (error) {
    console.warn("通知履歴の読み込みに失敗しました。", error);
    return [];
  }
}

function writeNotifications(
  userId: string | null,
  notifications: AppNotification[]
) {
  if (typeof window === "undefined" || !userId) return;
  try {
    const storageKey = getAppNotificationStorageKey(userId);
    const serialized = JSON.stringify(notifications);
    if (window.localStorage.getItem(storageKey) === serialized) return;
    window.localStorage.setItem(storageKey, serialized);
  } catch (error) {
    console.warn("通知履歴の保存に失敗しました。", error);
  }
}

function areNotificationsEqual(
  left: AppNotification[],
  right: AppNotification[]
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function safeDiagnostic(diagnostic?: FeedbackDiagnostic) {
  if (!diagnostic) return undefined;
  const safe: FeedbackDiagnostic = {};
  if (typeof diagnostic.route === "string") safe.route = diagnostic.route;
  if (typeof diagnostic.action === "string") safe.action = diagnostic.action;
  if (typeof diagnostic.endpoint === "string") {
    safe.endpoint = diagnostic.endpoint;
  }
  if (typeof diagnostic.status === "number") safe.status = diagnostic.status;
  if (typeof diagnostic.errorCode === "string") {
    safe.errorCode = diagnostic.errorCode;
  }
  if (typeof diagnostic.requestId === "string") {
    safe.requestId = diagnostic.requestId;
  }
  if (typeof diagnostic.occurredAt === "string") {
    safe.occurredAt = diagnostic.occurredAt;
  }
  return Object.keys(safe).length > 0 ? safe : undefined;
}

export function FeedbackProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  return (
    <FeedbackProviderForUser key={userId ?? "anonymous"} userId={userId}>
      {children}
    </FeedbackProviderForUser>
  );
}

function FeedbackProviderForUser({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    readNotifications(userId)
  );
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [notificationCenterRequest, setNotificationCenterRequest] =
    useState<FeedbackContextValue["notificationCenterRequest"]>(null);
  const notificationCenterRequestIdRef = useRef(0);
  const previousNotificationsRef = useRef(notifications);
  const storageSyncedNotificationsRef = useRef<AppNotification[] | null>(null);
  const hasPersistedNotificationsRef = useRef(false);

  useEffect(() => {
    const notificationsChanged =
      previousNotificationsRef.current !== notifications;
    previousNotificationsRef.current = notifications;

    if (storageSyncedNotificationsRef.current === notifications) {
      storageSyncedNotificationsRef.current = null;
      return;
    }
    if (hasPersistedNotificationsRef.current && !notificationsChanged) return;

    hasPersistedNotificationsRef.current = true;
    writeNotifications(userId, notifications);
  }, [notifications, userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;

    const storageKey = getAppNotificationStorageKey(userId);
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      if (event.storageArea && event.storageArea !== window.localStorage) {
        return;
      }

      const nextNotifications = readNotifications(userId);
      setNotifications((current) => {
        if (areNotificationsEqual(current, nextNotifications)) return current;
        storageSyncedNotificationsRef.current = nextNotifications;
        return nextNotifications;
      });
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

  const report = useCallback((input: FeedbackInput) => {
    const policy = getFeedbackPolicy(input.kind);
    const event: AppNotification = {
      id: createId(),
      kind: input.kind,
      severity: policy.severity,
      title: input.title,
      message: input.message,
      createdAt: new Date().toISOString(),
      read: false,
      diagnostic: safeDiagnostic(input.diagnostic),
    };

    if (policy.saveToCenter) {
      setNotifications((current) => cleanupNotifications([event, ...current]));
    }
    if (policy.showToast) {
      setToasts((current) => [...current, event]);
    }
    return event;
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((current) => {
      const notification = current.find((item) => item.id === id);
      if (!notification || notification.read) return current;

      return current.map((item) =>
        item.id === id ? { ...item, read: true } : item
      );
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((current) => {
      const next = current.filter((notification) => notification.id !== id);
      return next.length === current.length ? current : next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications((current) => (current.length === 0 ? current : []));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const openNotificationCenter = useCallback((notificationId: string) => {
    notificationCenterRequestIdRef.current += 1;
    setNotificationCenterRequest({
      notificationId,
      requestId: notificationCenterRequestIdRef.current,
    });
  }, []);
  const clearNotificationCenterRequest = useCallback(() => {
    setNotificationCenterRequest(null);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      notifications,
      toasts,
      unreadCount: notifications.filter((notification) => !notification.read)
        .length,
      report,
      markRead,
      removeNotification,
      clearNotifications,
      dismissToast,
      notificationCenterRequest,
      openNotificationCenter,
      clearNotificationCenterRequest,
    }),
    [
      notifications,
      toasts,
      report,
      markRead,
      removeNotification,
      clearNotifications,
      dismissToast,
      notificationCenterRequest,
      openNotificationCenter,
      clearNotificationCenterRequest,
    ]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

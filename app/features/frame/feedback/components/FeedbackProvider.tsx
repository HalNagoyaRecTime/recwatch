import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { FeedbackContext } from "./FeedbackContext";
import { getFeedbackPolicy } from "../application/feedback-policy";
import {
  APP_NOTIFICATION_MAX_COUNT,
  APP_NOTIFICATION_RETENTION_MS,
  APP_NOTIFICATION_STORAGE_KEY,
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

function readNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(APP_NOTIFICATION_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return cleanupNotifications(
      parsed.filter(isFeedbackNotification).map((notification) => ({
        ...notification,
        diagnostic: safeDiagnostic(notification.diagnostic),
      }))
    );
  } catch {
    return [];
  }
}

function writeNotifications(notifications: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      APP_NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch {
    // localStorageが利用できない環境ではメモリ上の履歴だけを維持します。
  }
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

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(readNotifications);
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  useEffect(() => {
    writeNotifications(notifications);
  }, [notifications]);

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
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      notifications,
      toasts,
      unreadCount: notifications.filter((notification) => !notification.read)
        .length,
      report,
      markRead,
      markAllRead,
      clearNotifications,
      dismissToast,
    }),
    [
      notifications,
      toasts,
      report,
      markRead,
      markAllRead,
      clearNotifications,
      dismissToast,
    ]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

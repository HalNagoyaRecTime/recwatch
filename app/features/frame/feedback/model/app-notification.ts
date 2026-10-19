export type FeedbackKind =
  | "validation"
  | "action-success"
  | "action-error"
  | "background-success"
  | "background-error"
  | "system-warning"
  | "system-error"
  | "info";

export type FeedbackSeverity = "info" | "success" | "warning" | "error";

export type FeedbackDiagnostic = {
  route?: string;
  action?: string;
  endpoint?: string;
  status?: number;
  errorCode?: string;
  requestId?: string;
  occurredAt?: string;
};

export type FeedbackInput = {
  kind: FeedbackKind;
  title: string;
  message: string;
  diagnostic?: FeedbackDiagnostic;
};

export type AppNotification = {
  id: string;
  kind: FeedbackKind;
  severity: FeedbackSeverity;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  diagnostic?: FeedbackDiagnostic;
};

export type NotificationCenterRequest = {
  notificationId: string;
  requestId: number;
};

export type FeedbackContextValue = {
  notifications: AppNotification[];
  toasts: AppNotification[];
  unreadCount: number;
  report: (input: FeedbackInput) => AppNotification;
  markRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  dismissToast: (id: string) => void;
  notificationCenterRequest: NotificationCenterRequest | null;
  openNotificationCenter: (notificationId: string) => void;
  clearNotificationCenterRequest: () => void;
};

export const APP_NOTIFICATION_STORAGE_KEY = "recwatch.app-notifications";
export function getAppNotificationStorageKey(userId: string) {
  return `${APP_NOTIFICATION_STORAGE_KEY}:${encodeURIComponent(userId)}`;
}
export const APP_NOTIFICATION_MAX_COUNT = 100;
export const APP_NOTIFICATION_RETENTION_DAYS = 30;
export const APP_NOTIFICATION_RETENTION_MS =
  APP_NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function clearStoredAppNotifications(userId?: string | null) {
  if (typeof window === "undefined") return;

  try {
    if (userId) {
      window.localStorage.removeItem(getAppNotificationStorageKey(userId));
    }
    window.localStorage.removeItem(APP_NOTIFICATION_STORAGE_KEY);
  } catch {
    // localStorageが利用できない環境では何もしません。
  }
}

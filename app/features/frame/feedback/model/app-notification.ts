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

export type FeedbackContextValue = {
  notifications: AppNotification[];
  toasts: AppNotification[];
  unreadCount: number;
  report: (input: FeedbackInput) => AppNotification;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  dismissToast: (id: string) => void;
};

export const APP_NOTIFICATION_STORAGE_KEY = "recwatch.app-notifications";
export const APP_NOTIFICATION_MAX_COUNT = 100;
export const APP_NOTIFICATION_RETENTION_DAYS = 30;
export const APP_NOTIFICATION_RETENTION_MS =
  APP_NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function severityForFeedbackKind(kind: FeedbackKind): FeedbackSeverity {
  switch (kind) {
    case "action-success":
    case "background-success":
      return "success";
    case "system-warning":
      return "warning";
    case "action-error":
    case "background-error":
    case "system-error":
      return "error";
    case "validation":
    case "info":
      return "info";
  }
}

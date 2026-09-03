import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { useFeedback } from "../hooks/useFeedback";
import type {
  AppNotification,
  FeedbackSeverity,
} from "../model/app-notification";
import { FloatingListSurface } from "~/components/ui/panel/FloatingListSurface";

const severityIcon = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon,
  error: AlertCircleIcon,
} as const;

const severityLabel: Record<FeedbackSeverity, string> = {
  info: "情報",
  success: "成功",
  warning: "警告",
  error: "エラー",
};

const NOTIFICATION_VISIBILITY_THRESHOLD = 0.5;
const NOTIFICATION_VISIBILITY_DELAY_MS = 400;

export function AppNotificationCenter() {
  const { notifications, markRead, removeNotification, clearNotifications } =
    useFeedback();
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const visibilityTimersRef = useRef(new Map<string, number>());

  const registerRow = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) {
      rowRefs.current.set(id, node);
    } else {
      rowRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const unreadIds = new Set(
      notifications
        .filter((notification) => !notification.read)
        .map((notification) => notification.id)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.notificationId;
          if (!id || !unreadIds.has(id)) {
            observer.unobserve(entry.target);
            continue;
          }

          const timer = visibilityTimersRef.current.get(id);
          const isVisible =
            entry.isIntersecting &&
            entry.intersectionRatio >= NOTIFICATION_VISIBILITY_THRESHOLD;

          if (isVisible && timer === undefined) {
            visibilityTimersRef.current.set(
              id,
              window.setTimeout(() => {
                markRead(id);
                visibilityTimersRef.current.delete(id);
                observer.unobserve(entry.target);
              }, NOTIFICATION_VISIBILITY_DELAY_MS)
            );
          } else if (!isVisible && timer !== undefined) {
            window.clearTimeout(timer);
            visibilityTimersRef.current.delete(id);
          }
        }
      },
      { threshold: NOTIFICATION_VISIBILITY_THRESHOLD }
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
  }, [markRead, notifications]);

  return (
    <div className="w-[min(20rem,calc(100vw-1rem))]">
      <FloatingListSurface
        scrollable
        style={{
          maxHeight: "min(60vh, var(--floating-panel-available-height))",
        }}
        fixedHeader={
          <div className="border-border-subtle bg-surface-base mx-2 flex items-center justify-between gap-3 border-b px-2.5 py-2">
            <h2 className="text-text-base text-base font-semibold">通知</h2>
            <button
              type="button"
              className="text-text-muted hover:bg-surface-hover hover:text-text-base rounded-md p-1.5"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
              aria-label="すべて削除"
            >
              <Trash2Icon aria-hidden="true" size={16} />
            </button>
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
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={() => markRead(notification.id)}
                onRemove={() => removeNotification(notification.id)}
                registerRow={registerRow}
              />
            ))}
          </ul>
        )}
      </FloatingListSurface>
    </div>
  );
}

function NotificationRow({
  notification,
  onRead,
  onRemove,
  registerRow,
}: {
  notification: AppNotification;
  onRead: () => void;
  onRemove: () => void;
  registerRow: (id: string, node: HTMLLIElement | null) => void;
}) {
  const Icon = severityIcon[notification.severity];

  return (
    <li
      ref={(node) => registerRow(notification.id, node)}
      className="group relative rounded-lg"
      data-notification-id={notification.id}
    >
      <button
        type="button"
        className={`hover:bg-surface-hover flex w-full items-start gap-2 rounded-lg px-2.5 py-2 pr-8 text-left ${notification.read ? "" : "bg-surface-muted"}`}
        onClick={onRead}
        onFocus={onRead}
        aria-label={`${notification.title}、${severityLabel[notification.severity]}`}
      >
        <Icon
          aria-hidden="true"
          className="text-brand-primary mt-0.5 shrink-0"
          size={16}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="text-text-base truncate text-sm font-medium">
              {notification.title}
            </span>
            <span className="text-text-subtle shrink-0 text-[10px]">
              {severityLabel[notification.severity]}
            </span>
            {!notification.read && (
              <span
                className="bg-brand-primary h-1.5 w-1.5 shrink-0 rounded-full"
                aria-label="未読"
              />
            )}
            <time
              className="text-text-subtle ml-auto shrink-0 text-[11px] transition-opacity group-focus-within:opacity-0 group-hover:opacity-0"
              dateTime={notification.createdAt}
            >
              {formatNotificationClock(notification.createdAt)}
            </time>
          </span>
          <span className="text-text-muted mt-0.5 block text-xs">
            {notification.message}
          </span>
        </span>
      </button>
      <button
        type="button"
        className="text-text-muted hover:bg-surface-hover hover:text-text-base absolute top-1.5 right-1.5 rounded-md p-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        onClick={onRemove}
        aria-label={`${notification.title}を削除`}
      >
        <XIcon aria-hidden="true" size={15} />
      </button>
      {notification.diagnostic && (
        <details className="text-text-muted px-2.5 pb-2 text-xs">
          <summary className="cursor-pointer">詳細</summary>
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
            <DiagnosticValue label="エラー内容" value={notification.message} />
            <DiagnosticValue
              label="時刻"
              value={formatNotificationDateTime(
                notification.diagnostic.occurredAt ?? notification.createdAt
              )}
            />
            <DiagnosticValue
              label="画面"
              value={notification.diagnostic.route}
            />
            <DiagnosticValue
              label="操作"
              value={notification.diagnostic.action}
            />
            <DiagnosticValue
              label="HTTP Status"
              value={notification.diagnostic.status?.toString()}
            />
            <DiagnosticValue
              label="Error Code"
              value={notification.diagnostic.errorCode}
            />
            <DiagnosticValue
              label="Request ID"
              value={notification.diagnostic.requestId}
            />
            <DiagnosticValue
              label="Endpoint"
              value={notification.diagnostic.endpoint}
            />
          </dl>
        </details>
      )}
    </li>
  );
}

function DiagnosticValue({ label, value }: { label: string; value?: string }) {
  return value ? (
    <>
      <dt>{label}</dt>
      <dd className="break-all select-text">{value}</dd>
    </>
  ) : null;
}

function formatNotificationTime(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : date.toLocaleString("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
      });
}

function formatNotificationClock(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
}

function formatNotificationDateTime(createdAt: string) {
  return formatNotificationTime(createdAt);
}

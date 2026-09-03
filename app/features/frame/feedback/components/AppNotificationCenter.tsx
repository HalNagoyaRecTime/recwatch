import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  Minimize2Icon,
  XIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
              className="text-text-muted hover:text-text-base rounded-md p-1.5 transition-colors"
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
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const contentId = `notification-content-${notification.id}`;
  const diagnostic = notification.diagnostic;

  return (
    <li
      ref={(node) => registerRow(notification.id, node)}
      className="group/notification rounded-lg"
      data-notification-id={notification.id}
      onFocus={onRead}
      onClick={onRead}
    >
      <div
        className={`hover:bg-surface-hover rounded-lg px-2.5 py-2 transition-colors ${notification.read ? "" : "bg-surface-muted"}`}
      >
        <div className="flex items-start gap-2">
          <Icon
            aria-hidden="true"
            className="text-brand-primary mt-0.5 shrink-0"
            size={16}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-text-base flex min-w-0 flex-1 items-center gap-1.5 text-left"
                aria-label={`${notification.title}、${severityLabel[notification.severity]}`}
              >
                <span className="truncate text-sm font-medium">
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
              </button>
              <div className="text-text-muted grid shrink-0 items-center">
                <time
                  className="pointer-events-none col-start-1 row-start-1 justify-self-end text-[11px] transition-opacity group-focus-within/notification:opacity-0 group-hover/notification:opacity-0 [@media(hover:none)]:opacity-0"
                  dateTime={notification.createdAt}
                >
                  {formatNotificationClock(notification.createdAt)}
                </time>
                <div className="relative col-start-1 row-start-1 flex justify-end gap-0.5 opacity-0 transition-opacity group-focus-within/notification:opacity-100 group-hover/notification:opacity-100 [@media(hover:none)]:opacity-100">
                  {isMessageExpanded && (
                    <button
                      type="button"
                      className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                      aria-label="エラー内容を小さくする"
                      aria-expanded={isMessageExpanded}
                      aria-controls={contentId}
                      onClick={() => setIsMessageExpanded(false)}
                    >
                      <Minimize2Icon aria-hidden="true" size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                    onClick={onRemove}
                    aria-label={`${notification.title}を削除`}
                  >
                    <XIcon aria-hidden="true" size={13} />
                  </button>
                </div>
              </div>
            </div>
            <div id={contentId} className="text-text-muted mt-0.5 text-xs">
              <button
                type="button"
                className="block w-full rounded-md text-left break-words whitespace-pre-wrap select-text"
                onClick={() => setIsMessageExpanded(true)}
                aria-label="エラー内容を表示"
                aria-expanded={isMessageExpanded}
                aria-controls={contentId}
              >
                <span className={isMessageExpanded ? "" : "line-clamp-3"}>
                  {notification.message}
                </span>
              </button>
              {diagnostic && isMessageExpanded && (
                <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
                  <DiagnosticValue
                    label="時刻"
                    value={formatNotificationDateTime(
                      diagnostic?.occurredAt ?? notification.createdAt
                    )}
                  />
                  <DiagnosticValue label="画面" value={diagnostic?.route} />
                  <DiagnosticValue label="操作" value={diagnostic?.action} />
                  <DiagnosticValue
                    label="HTTP Status"
                    value={diagnostic?.status?.toString()}
                  />
                  <DiagnosticValue
                    label="Error Code"
                    value={diagnostic?.errorCode}
                  />
                  <DiagnosticValue
                    label="Request ID"
                    value={diagnostic?.requestId}
                  />
                  <DiagnosticValue
                    label="Endpoint"
                    value={diagnostic?.endpoint}
                  />
                </dl>
              )}
            </div>
          </div>
        </div>
      </div>
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

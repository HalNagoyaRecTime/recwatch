import {
  AlertCircleIcon,
  CheckIcon,
  CheckCircle2Icon,
  CopyIcon,
  InfoIcon,
  Minimize2Icon,
  XIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useFeedback } from "../hooks/useFeedback";
import type { AppNotification } from "../model/app-notification";
import { FloatingListSurface } from "~/components/ui/panel/FloatingListSurface";
import { Button } from "~/components/ui/button/Button";

const severityIcon = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon,
  error: AlertCircleIcon,
} as const;

const severityIconClass = {
  info: "text-brand-primary",
  success: "text-tone-success-text",
  warning: "text-tone-warning-text",
  error: "text-tone-danger-text",
} as const;

const severityLabel = {
  info: "情報",
  success: "成功",
  warning: "警告",
  error: "エラー",
} as const;

const NOTIFICATION_VISIBILITY_THRESHOLD = 0.5;
const NOTIFICATION_VISIBILITY_DELAY_MS = 400;

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
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const focusRefs = useRef(new Map<string, HTMLButtonElement>());
  const visibilityTimersRef = useRef(new Map<string, number>());
  const pendingFocusIdRef = useRef<string | null>(null);

  const registerRow = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) {
      rowRefs.current.set(id, node);
    } else {
      rowRefs.current.delete(id);
    }
  }, []);

  const registerFocus = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      if (node) {
        focusRefs.current.set(id, node);
      } else {
        focusRefs.current.delete(id);
      }
    },
    []
  );

  const focusNotification = useCallback((id: string) => {
    const node = focusRefs.current.get(id);
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

  useEffect(() => {
    if (!onRegisterFocusFirst) return;
    return onRegisterFocusFirst(() => {
      const first = notifications[0];
      if (first) focusNotification(first.id);
    });
  }, [focusNotification, notifications, onRegisterFocusFirst]);

  useEffect(() => {
    const pendingId = pendingFocusIdRef.current;
    if (pendingId === null) return;
    pendingFocusIdRef.current = null;
    if (notifications.some((notification) => notification.id === pendingId)) {
      focusNotification(pendingId);
    } else {
      onFocusTrigger?.();
    }
  }, [focusNotification, notifications, onFocusTrigger]);

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
          if (!id || !unreadIds.has(id) || id === initialNotificationId) {
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
  }, [initialNotificationId, markRead, notifications]);

  const handleRemove = useCallback(
    (id: string) => {
      const index = notifications.findIndex(
        (notification) => notification.id === id
      );
      pendingFocusIdRef.current =
        notifications[index + 1]?.id ?? notifications[index - 1]?.id ?? "";
      removeNotification(id);
    },
    [notifications, removeNotification]
  );

  return (
    <div className="w-[min(20rem,calc(100vw-1rem))]">
      <FloatingListSurface
        scrollable
        style={{
          maxHeight: "min(35vh, var(--floating-panel-available-height))",
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
            {notifications.map((notification, index) => (
              <NotificationRow
                key={`${notification.id}-${notification.id === initialNotificationId}`}
                notification={notification}
                onRead={() => markRead(notification.id)}
                onRemove={() => handleRemove(notification.id)}
                registerRow={registerRow}
                registerFocus={registerFocus}
                focusNotificationAt={focusNotificationAt}
                notificationIndex={index}
                notificationCount={notifications.length}
                onFocusTrigger={onFocusTrigger}
                initiallyExpanded={notification.id === initialNotificationId}
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
  registerFocus,
  focusNotificationAt,
  notificationIndex,
  notificationCount,
  onFocusTrigger,
  initiallyExpanded,
}: {
  notification: AppNotification;
  onRead: () => void;
  onRemove: () => void;
  registerRow: (id: string, node: HTMLLIElement | null) => void;
  registerFocus: (id: string, node: HTMLButtonElement | null) => void;
  focusNotificationAt: (index: number) => void;
  notificationIndex: number;
  notificationCount: number;
  onFocusTrigger?: () => void;
  initiallyExpanded: boolean;
}) {
  const Icon = severityIcon[notification.severity];
  const [isMessageExpanded, setIsMessageExpanded] = useState(initiallyExpanded);

  const [isCopied, setIsCopied] = useState(false);
  const diagnosticId = `notification-diagnostic-${notification.id}`;
  const diagnostic = notification.diagnostic;
  const canExpand = Boolean(diagnostic) || notification.message.length > 120;
  const focusLabel = `${notification.title}、${severityLabel[notification.severity]}、${notification.read ? "既読" : "未読"}`;

  return (
    <li
      ref={(node) => registerRow(notification.id, node)}
      className="group/notification rounded-lg"
      data-notification-id={notification.id}
      onFocus={onRead}
      onClick={() => {
        onRead();
        if (canExpand) setIsMessageExpanded((expanded) => !expanded);
      }}
    >
      <div
        className={`hover:bg-surface-hover rounded-lg px-2.5 py-2 transition-colors ${notification.read ? "" : "bg-surface-muted"}`}
      >
        <div className="flex items-start gap-2">
          <Icon
            aria-hidden="true"
            className={`${severityIconClass[notification.severity]} mt-0.5 shrink-0`}
            size={16}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="text-text-base flex min-w-0 flex-1 items-center gap-1.5 text-left">
                <span className="truncate text-sm font-medium">
                  {notification.title}
                </span>
                {!notification.read && (
                  <span
                    className="bg-brand-primary h-1.5 w-1.5 shrink-0 rounded-full"
                    aria-label="未読"
                  />
                )}
              </div>
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
                      aria-label="通知を小さくする"
                      aria-expanded={isMessageExpanded}
                      aria-controls={diagnosticId}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRead();
                        setIsMessageExpanded(false);
                      }}
                    >
                      <Minimize2Icon aria-hidden="true" size={13} />
                    </button>
                  )}
                  {isMessageExpanded && (
                    <button
                      type="button"
                      className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                      aria-label={
                        isCopied ? "コピーしました" : "通知内容をコピー"
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        onRead();
                        void copyNotificationDetails(notification).then(() => {
                          setIsCopied(true);
                          window.setTimeout(() => setIsCopied(false), 1200);
                        });
                      }}
                    >
                      {isCopied ? (
                        <CheckIcon aria-hidden="true" size={13} />
                      ) : (
                        <CopyIcon aria-hidden="true" size={13} />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove();
                    }}
                    aria-label={`${notification.title}を削除`}
                  >
                    <XIcon aria-hidden="true" size={13} />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-text-muted mt-0.5 text-xs">
              <button
                ref={(node) => registerFocus(notification.id, node)}
                type="button"
                className="block w-full rounded-md text-left break-words whitespace-pre-wrap select-text"
                onClick={(event) => {
                  event.stopPropagation();
                  onRead();
                  if (canExpand) setIsMessageExpanded((expanded) => !expanded);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    if (canExpand) {
                      event.preventDefault();
                      setIsMessageExpanded(true);
                    }
                  } else if (event.key === "ArrowLeft") {
                    if (canExpand) {
                      event.preventDefault();
                      setIsMessageExpanded(false);
                    }
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    if (notificationIndex + 1 < notificationCount) {
                      focusNotificationAt(notificationIndex + 1);
                    }
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    if (notificationIndex === 0) {
                      onFocusTrigger?.();
                    } else {
                      focusNotificationAt(notificationIndex - 1);
                    }
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    focusNotificationAt(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    focusNotificationAt(notificationCount - 1);
                  }
                }}
                aria-label={`${focusLabel}、${
                  canExpand
                    ? isMessageExpanded
                      ? "通知内容を小さくする"
                      : "通知内容を表示"
                    : "通知内容"
                }`}
                aria-expanded={canExpand ? isMessageExpanded : undefined}
                aria-controls={
                  canExpand && diagnostic ? diagnosticId : undefined
                }
                data-notification-id={notification.id}
              >
                <span
                  className={
                    canExpand && !isMessageExpanded ? "line-clamp-3" : ""
                  }
                >
                  {notification.message}
                </span>
              </button>
              {diagnostic && isMessageExpanded && (
                <div
                  id={diagnosticId}
                  onClick={(event) => event.stopPropagation()}
                >
                  <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
                    <DiagnosticValue
                      label="時刻"
                      value={diagnostic.occurredAt ?? notification.createdAt}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

async function copyNotificationDetails(notification: AppNotification) {
  const diagnostic = notification.diagnostic;
  const lines = [notification.title, notification.message];
  if (diagnostic) {
    const details: Array<[string, string | undefined]> = [
      ["時刻", diagnostic.occurredAt],
      ["画面", diagnostic.route],
      ["操作", diagnostic.action],
      ["HTTP Status", diagnostic.status?.toString()],
      ["Error Code", diagnostic.errorCode],
      ["Request ID", diagnostic.requestId],
      ["Endpoint", diagnostic.endpoint],
    ];
    lines.push(
      ...details
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
        .map(([label, value]) => `${label}: ${value}`)
    );
  }
  await navigator.clipboard?.writeText(lines.join("\n"));
}

function DiagnosticValue({ label, value }: { label: string; value?: string }) {
  return value ? (
    <>
      <dt>{label}</dt>
      <dd className="break-all select-text">{value}</dd>
    </>
  ) : null;
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

import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  Minimize2Icon,
  XIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import type { AppNotification } from "../model/app-notification";
import { AppNotificationDiagnostic } from "./AppNotificationDiagnostic";
import {
  notificationSeverityIcon,
  notificationSeverityIconClass,
} from "./notification-severity";

const severityLabel = {
  info: "情報",
  success: "成功",
  warning: "警告",
  error: "エラー",
} as const;

type AppNotificationRowProps = {
  notification: AppNotification;
  initiallyExpanded: boolean;
  suppressInitialFocusRead: boolean;
  registerRow: (id: string, node: HTMLLIElement | null) => void;
  registerMessage: (id: string, node: HTMLButtonElement | null) => void;
  onRead: () => void;
  onRemove: () => void;
  focusNotification: (id: string) => void;
  handleMessageKeyDown: (
    id: string,
    event: KeyboardEvent<HTMLButtonElement>
  ) => void;
  handleActionKeyDown: (id: string, event: KeyboardEvent<HTMLElement>) => void;
  focusRequestId?: number | string | null;
};

type ExpansionState = {
  requestId?: number | string | null;
  expanded: boolean;
};

export function AppNotificationRow({
  notification,
  initiallyExpanded,
  suppressInitialFocusRead,
  registerRow,
  registerMessage,
  onRead,
  onRemove,
  focusNotification,
  handleMessageKeyDown,
  handleActionKeyDown,
  focusRequestId,
}: AppNotificationRowProps) {
  const Icon = notificationSeverityIcon[notification.severity];
  const [expansionState, setExpansionState] = useState<ExpansionState>(() => ({
    requestId: focusRequestId,
    expanded: initiallyExpanded,
  }));
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const copyResetTimerRef = useRef<number | null>(null);
  const suppressNextFocusReadRef = useRef(suppressInitialFocusRead);
  const diagnosticId = `notification-diagnostic-${notification.id}`;
  const diagnostic = notification.diagnostic;
  const canExpand = Boolean(diagnostic) || notification.message.length > 120;
  const focusLabel = `${notification.title}、${severityLabel[notification.severity]}、${notification.read ? "既読" : "未読"}`;
  const isMessageExpanded =
    expansionState.requestId === focusRequestId
      ? expansionState.expanded
      : initiallyExpanded || expansionState.expanded;
  const copyButtonLabel =
    copyStatus === "success"
      ? "コピーしました"
      : copyStatus === "error"
        ? "コピーに失敗しました"
        : "通知内容をコピー";

  useEffect(() => {
    if (suppressInitialFocusRead) {
      suppressNextFocusReadRef.current = true;
    }
  }, [focusRequestId, suppressInitialFocusRead]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  const updateCopyStatus = (status: CopyStatus) => {
    setCopyStatus(status);
    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current);
    }
    copyResetTimerRef.current = window.setTimeout(() => {
      copyResetTimerRef.current = null;
      setCopyStatus("idle");
    }, COPY_STATUS_DISPLAY_MS);
  };

  const setMessageExpanded = (expanded: boolean) => {
    setExpansionState({ requestId: focusRequestId, expanded });
  };

  const toggleMessage = () => {
    onRead();
    if (canExpand) setMessageExpanded(!isMessageExpanded);
  };

  const handleMessageClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleMessage();
  };

  const handleFocus = () => {
    if (suppressNextFocusReadRef.current) {
      suppressNextFocusReadRef.current = false;
      return;
    }
    onRead();
  };

  const handleMessageKeyDownWithToggle = (
    event: KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key === "ArrowRight") {
      if (canExpand) {
        event.preventDefault();
        setMessageExpanded(true);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      if (canExpand) {
        event.preventDefault();
        setMessageExpanded(false);
      }
      return;
    }
    handleMessageKeyDown(notification.id, event);
  };

  return (
    <li
      ref={(node) => registerRow(notification.id, node)}
      className="group/notification rounded-lg"
      data-notification-id={notification.id}
      onFocus={handleFocus}
      onClick={onRead}
    >
      <div
        className={`hover:bg-surface-hover rounded-lg px-2.5 py-2 transition-colors ${notification.read ? "" : "bg-surface-muted"}`}
      >
        <div className="flex items-start gap-2">
          <Icon
            aria-hidden="true"
            className={`${notificationSeverityIconClass[notification.severity]} mt-0.5 shrink-0`}
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
                <div
                  className="relative col-start-1 row-start-1 flex justify-end gap-0.5 opacity-0 transition-opacity group-focus-within/notification:opacity-100 group-hover/notification:opacity-100 [@media(hover:none)]:opacity-100"
                  onKeyDown={(event) =>
                    handleActionKeyDown(notification.id, event)
                  }
                >
                  {isMessageExpanded && (
                    <button
                      type="button"
                      className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                      aria-label={copyButtonLabel}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRead();
                        void copyNotificationDetails(notification)
                          .then(() => updateCopyStatus("success"))
                          .catch(() => updateCopyStatus("error"));
                      }}
                    >
                      {copyStatus === "success" ? (
                        <CheckIcon aria-hidden="true" size={13} />
                      ) : copyStatus === "error" ? (
                        <AlertCircleIcon aria-hidden="true" size={13} />
                      ) : (
                        <CopyIcon aria-hidden="true" size={13} />
                      )}
                    </button>
                  )}
                  {isMessageExpanded && (
                    <button
                      type="button"
                      className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                      aria-label="通知を小さくする"
                      aria-expanded={isMessageExpanded}
                      aria-controls={diagnostic ? diagnosticId : undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRead();
                        setMessageExpanded(false);
                        focusNotification(notification.id);
                      }}
                    >
                      <Minimize2Icon aria-hidden="true" size={13} />
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
            <button
              ref={(node) => registerMessage(notification.id, node)}
              type="button"
              className="focus-visible:outline-brand-primary text-text-muted mt-0.5 block w-full rounded-md text-left text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={handleMessageClick}
              onKeyDown={handleMessageKeyDownWithToggle}
              aria-label={`${focusLabel}、${
                canExpand
                  ? isMessageExpanded
                    ? "詳細を閉じる"
                    : "詳細を表示"
                  : "通知内容"
              }`}
              aria-expanded={canExpand ? isMessageExpanded : undefined}
              aria-controls={
                canExpand && diagnostic && isMessageExpanded
                  ? diagnosticId
                  : undefined
              }
            >
              <span
                className={
                  canExpand && !isMessageExpanded ? "line-clamp-3" : ""
                }
              >
                {notification.message}
              </span>
            </button>
          </div>
        </div>
        {diagnostic && isMessageExpanded && (
          <AppNotificationDiagnostic
            id={diagnosticId}
            diagnostic={diagnostic}
            createdAt={notification.createdAt}
          />
        )}
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
  if (
    typeof navigator === "undefined" ||
    typeof navigator.clipboard?.writeText !== "function"
  ) {
    throw new Error("Clipboard APIを利用できません");
  }
  await navigator.clipboard.writeText(lines.join("\n"));
}

type CopyStatus = "idle" | "success" | "error";
const COPY_STATUS_DISPLAY_MS = 1200;

function formatNotificationClock(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
}

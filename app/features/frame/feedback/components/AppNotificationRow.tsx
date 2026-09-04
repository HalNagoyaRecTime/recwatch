import {
  AlertCircleIcon,
  CheckIcon,
  CheckCircle2Icon,
  CopyIcon,
  InfoIcon,
  Minimize2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import type { AppNotification } from "../model/app-notification";
import { AppNotificationDiagnostic } from "./AppNotificationDiagnostic";

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
}: AppNotificationRowProps) {
  const Icon = severityIcon[notification.severity];
  const [isMessageExpanded, setIsMessageExpanded] = useState(initiallyExpanded);
  const [isCopied, setIsCopied] = useState(false);
  const suppressNextFocusReadRef = useRef(suppressInitialFocusRead);
  const diagnosticId = `notification-diagnostic-${notification.id}`;
  const diagnostic = notification.diagnostic;
  const canExpand = Boolean(diagnostic) || notification.message.length > 120;
  const focusLabel = `${notification.title}、${severityLabel[notification.severity]}、${notification.read ? "既読" : "未読"}`;

  const toggleMessage = () => {
    onRead();
    if (canExpand) setIsMessageExpanded((expanded) => !expanded);
  };

  const handleMessageClick = () => {
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
        setIsMessageExpanded(true);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      if (canExpand) {
        event.preventDefault();
        setIsMessageExpanded(false);
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
                      aria-label="通知を小さくする"
                      aria-expanded={isMessageExpanded}
                      aria-controls={diagnostic ? diagnosticId : undefined}
                      onClick={() => {
                        onRead();
                        setIsMessageExpanded(false);
                        focusNotification(notification.id);
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
                      onClick={() => {
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
                    onClick={onRemove}
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
  await navigator.clipboard?.writeText(lines.join("\n"));
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

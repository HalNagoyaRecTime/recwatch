import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";

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

export function AppNotificationCenter() {
  const { notifications, markRead, clearNotifications } = useFeedback();

  return (
    <div className="w-[min(20rem,calc(100vw-1rem))]">
      <FloatingListSurface
        scrollable
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
          <ul className="mt-2 flex flex-col gap-1" aria-label="通知一覧">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={() => markRead(notification.id)}
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
}: {
  notification: AppNotification;
  onRead: () => void;
}) {
  const Icon = severityIcon[notification.severity];

  return (
    <li className="rounded-lg">
      <button
        type="button"
        className={`hover:bg-surface-hover flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left ${notification.read ? "" : "bg-surface-muted"}`}
        onClick={onRead}
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
          </span>
          <span className="text-text-muted mt-0.5 block text-xs">
            {notification.message}
          </span>
          <time
            className="text-text-subtle mt-1 block text-[11px]"
            dateTime={notification.createdAt}
          >
            {formatNotificationTime(notification.createdAt)}
          </time>
        </span>
      </button>
      {notification.diagnostic && (
        <details className="text-text-muted px-2.5 pb-2 text-xs">
          <summary className="cursor-pointer">詳細</summary>
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
            <DiagnosticValue label="エラー内容" value={notification.message} />
            <DiagnosticValue label="時刻" value={notification.createdAt} />
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
      <dd className="truncate">{value}</dd>
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

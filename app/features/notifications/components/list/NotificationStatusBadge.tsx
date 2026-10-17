import { Check, Clock3, LoaderCircle, OctagonX, Send, X } from "lucide-react";

import type { AdminNotificationListSchedule } from "~/features/notifications/api/contracts/admin-notification-query-api";

type NotificationScheduleStatus = AdminNotificationListSchedule["status"];

const statusPresentation = {
  scheduled: {
    icon: Clock3,
    label: "配信予定",
    tone: "text-text-muted bg-surface-muted",
  },
  resolving: {
    icon: LoaderCircle,
    label: "対象解決中",
    tone: "text-text-muted bg-surface-muted",
  },
  sending: {
    icon: Send,
    label: "送信中",
    tone: "text-brand-primary bg-surface-muted",
  },
  completed: {
    icon: Check,
    label: "配信処理完了",
    tone: "text-tone-success-text bg-tone-success-bg",
  },
  failed: {
    icon: X,
    label: "配信失敗",
    tone: "text-tone-danger-text bg-tone-danger-bg",
  },
  stopped: {
    icon: OctagonX,
    label: "停止済み",
    tone: "text-text-muted bg-surface-muted",
  },
} as const satisfies Record<
  NotificationScheduleStatus,
  { icon: typeof Check; label: string; tone: string }
>;

export function NotificationStatusBadge({
  status,
}: {
  status: NotificationScheduleStatus;
}) {
  const presentation = statusPresentation[status];
  const Icon = presentation.icon;

  return (
    <span
      className={`${presentation.tone} inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {presentation.label}
    </span>
  );
}

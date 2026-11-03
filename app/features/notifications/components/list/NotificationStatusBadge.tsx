import { notificationScheduleStatusLabels } from "~/features/notifications/components/list/notification-display";
import { Check, Clock3, LoaderCircle, OctagonX, Send, X } from "lucide-react";

import type { AdminNotificationListSchedule } from "~/features/notifications/api/contracts/admin-notification-query-api";

type NotificationScheduleStatus = AdminNotificationListSchedule["status"];

const statusPresentation = {
  scheduled: {
    icon: Clock3,
    tone: "text-text-muted bg-surface-muted",
  },
  resolving: {
    icon: LoaderCircle,
    tone: "text-text-muted bg-surface-muted",
  },
  sending: {
    icon: Send,
    tone: "text-brand-primary bg-surface-muted",
  },
  completed: {
    icon: Check,
    tone: "text-tone-success-text bg-tone-success-bg",
  },
  failed: {
    icon: X,
    tone: "text-tone-danger-text bg-tone-danger-bg",
  },
  stopped: {
    icon: OctagonX,
    tone: "text-text-muted bg-surface-muted",
  },
} as const satisfies Record<
  NotificationScheduleStatus,
  { icon: typeof Check; tone: string }
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
      {notificationScheduleStatusLabels[status]}
    </span>
  );
}

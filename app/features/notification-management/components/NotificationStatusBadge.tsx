import { cn } from "~/lib/cn";

import type { ManagedNotificationStatus } from "~/features/notifications/model/notification";

type NotificationStatusBadgeProps = {
  status: ManagedNotificationStatus;
};

const statusPresentation: Record<
  ManagedNotificationStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "未送信",
    className:
      "border-[color:var(--tone-blue-border)] bg-[color:var(--tone-blue-bg)] text-[color:var(--tone-blue-text)]",
  },
  sending: {
    label: "送信中",
    className:
      "border-[color:var(--tone-cyan-border)] bg-[color:var(--tone-cyan-bg)] text-[color:var(--tone-cyan-text)]",
  },
  sent: {
    label: "配信済み",
    className:
      "border-[color:var(--tone-green-border)] bg-[color:var(--tone-green-bg)] text-[color:var(--tone-green-text)]",
  },
  failed: {
    label: "送信失敗",
    className:
      "border-[color:var(--tone-red-border)] bg-[color:var(--tone-red-bg)] text-[color:var(--tone-red-text)]",
  },
};

export function NotificationStatusBadge({
  status,
}: NotificationStatusBadgeProps) {
  const presentation = statusPresentation[status];

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        presentation.className
      )}
    >
      {presentation.label}
    </span>
  );
}

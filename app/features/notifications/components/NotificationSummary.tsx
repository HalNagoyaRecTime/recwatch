import type { NotificationDraft } from "../model/notification-draft";
import { notificationAudienceLabels } from "../model/notification-draft";
import type { NotificationGroup } from "../model/notification-group";

type NotificationSummaryProps = {
  draft: NotificationDraft;
  deliveryTime: string;
  groups: NotificationGroup[];
};

type NotificationSummaryKey =
  | "title"
  | "body"
  | "audienceType"
  | "deliveryTime";

const rows: Array<{ key: NotificationSummaryKey; label: string }> = [
  { key: "title", label: "タイトル" },
  { key: "body", label: "本文" },
  { key: "audienceType", label: "通知対象" },
  { key: "deliveryTime", label: "配信時間" },
];

export function NotificationSummary({
  draft,
  deliveryTime,
  groups,
}: NotificationSummaryProps) {
  const selectedGroup = groups.find((group) => group.id === draft.groupId);
  const values: Record<(typeof rows)[number]["key"], string> = {
    title: draft.title || "-",
    body: draft.body || "-",
    audienceType:
      draft.audienceType === "group"
        ? selectedGroup?.name || notificationAudienceLabels.group
        : notificationAudienceLabels.all,
    deliveryTime,
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)]">
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid min-h-14 grid-cols-[108px_minmax(0,1fr)] border-b border-[color:var(--border-1)] last:border-b-0"
        >
          <div className="px-4 py-3 text-xs text-[color:var(--text-3)]">
            {row.label}
          </div>
          <div className="min-w-0 px-4 py-3 text-sm leading-6 break-words">
            {values[row.key]}
          </div>
        </div>
      ))}
    </div>
  );
}

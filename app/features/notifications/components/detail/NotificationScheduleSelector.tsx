import { Select } from "~/components/ui/form/Select";
import type { NotificationScheduleSummary } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { NotificationStatusBadge } from "~/features/notifications/components/list/NotificationStatusBadge";
import { formatNotificationScheduleDateTime } from "~/features/notifications/components/list/notification-display";
export function NotificationScheduleSelector({
  schedules,
  selectedScheduleId,
  onSelect,
}: {
  schedules: NotificationScheduleSummary[];
  selectedScheduleId: number | null;
  onSelect: (id: number) => void;
}) {
  const selected = schedules.find(
    (item) => item.notificationScheduleId === selectedScheduleId
  );
  if (!selected)
    return <p className="text-text-muted text-sm">配信履歴はありません。</p>;
  const index = schedules.indexOf(selected);
  return (
    <div className="border-border-base bg-surface-base app-rounded flex flex-wrap items-center justify-between gap-3 border px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <strong>{index + 1}回目</strong>
        <span>{formatNotificationScheduleDateTime(selected.sendAt)}</span>
        <span className="text-text-muted text-xs">
          Schedule #{selected.notificationScheduleId}
        </span>
        <NotificationStatusBadge status={selected.status} />
      </div>
      <Select
        ariaLabel="配信回を変更"
        value={String(selected.notificationScheduleId)}
        onValueChange={(id) => onSelect(Number(id))}
        options={schedules.map((item, index) => ({
          value: String(item.notificationScheduleId),
          label: `${index + 1}回目 / ${formatNotificationScheduleDateTime(item.sendAt)} / #${item.notificationScheduleId}`,
        }))}
      />
    </div>
  );
}

import type {
  NotificationDeliveryStatus,
  NotificationHistoryItem,
} from "~/features/notifications/model/notification-history";

type NotificationHistoryTableProps = {
  items: NotificationHistoryItem[];
};

const statusLabel: Record<NotificationDeliveryStatus, string> = {
  failed: "失敗",
  sending: "送信中",
  sent: "送信済み",
};

const statusClassName: Record<NotificationDeliveryStatus, string> = {
  failed:
    "border-[color:var(--tone-red-border)] bg-[color:var(--tone-red-bg)] text-[color:var(--tone-red-text)]",
  sending:
    "border-[color:var(--tone-blue-border)] bg-[color:var(--tone-blue-bg)] text-[color:var(--tone-blue-text)]",
  sent: "border-[color:var(--tone-green-border)] bg-[color:var(--tone-green-bg)] text-[color:var(--tone-green-text)]",
};

export function NotificationHistoryTable({
  items,
}: NotificationHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-[color:var(--border-1)] bg-[color:var(--surface-2)] text-xs text-[color:var(--text-3)] uppercase">
            <tr>
              <th className="px-4 py-3">件名</th>
              <th className="px-4 py-3">配信対象</th>
              <th className="px-4 py-3">配信日時</th>
              <th className="px-4 py-3">対象者数</th>
              <th className="px-4 py-3">状態</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[color:var(--border-1)] last:border-b-0 hover:bg-[color:var(--surface-2)]"
              >
                <td className="px-4 py-4 align-top">
                  <div className="font-semibold text-[color:var(--text-1)]">
                    {item.title}
                  </div>
                  <div className="mt-1 max-w-[34rem] text-xs leading-5 text-[color:var(--text-2)]">
                    {item.body}
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-[color:var(--text-1)]">
                  {item.targetLabel}
                </td>
                <td className="px-4 py-4 align-top text-[color:var(--text-2)]">
                  {item.deliveredAt}
                </td>
                <td className="px-4 py-4 align-top text-[color:var(--text-2)]">
                  {item.recipientCount}件
                </td>
                <td className="px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName[item.status]}`}
                  >
                    {statusLabel[item.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

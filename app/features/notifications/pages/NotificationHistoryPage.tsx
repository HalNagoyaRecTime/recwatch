import { AdminPageTitle } from "~/features/admin-pages/components/AdminPageTitle";
import { NotificationHistoryTable } from "~/features/notifications/components/NotificationHistoryTable";
import type { NotificationHistoryItem } from "~/features/notifications/model/notification-history";

type NotificationHistoryPageProps = {
  items: NotificationHistoryItem[];
};

export function NotificationHistoryPage({
  items,
}: NotificationHistoryPageProps) {
  const sentCount = items.filter((item) => item.status === "sent").length;
  const totalRecipientCount = items.reduce(
    (sum, item) => sum + item.recipientCount,
    0
  );

  return (
    <div className="page">
      <AdminPageTitle
        eyebrow="通知"
        title="通知履歴"
        description="配信済み通知の件名、本文、配信日時、配信対象を確認します。"
      />

      <section className="mb-[18px] grid gap-[18px] md:grid-cols-3">
        <article className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
          <div className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
            通知件数
          </div>
          <div className="mt-2 text-3xl font-semibold text-[color:var(--text-1)]">
            {items.length}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-2)]">
            履歴に表示している通知件数
          </p>
        </article>
        <article className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
          <div className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
            送信済み
          </div>
          <div className="mt-2 text-3xl font-semibold text-[color:var(--text-1)]">
            {sentCount}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-2)]">
            送信済みとして確認できる件数
          </p>
        </article>
        <article className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
          <div className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
            対象者
          </div>
          <div className="mt-2 text-3xl font-semibold text-[color:var(--text-1)]">
            {totalRecipientCount}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-2)]">
            表示中の配信対象者数
          </p>
        </article>
      </section>

      <NotificationHistoryTable items={items} />
    </div>
  );
}

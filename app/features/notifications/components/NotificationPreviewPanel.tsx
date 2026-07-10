import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import {
  getTargetCandidates,
  getTargetOption,
} from "~/features/notifications/model/notification-target";

type NotificationPreviewPanelProps = {
  draft: NotificationDraft;
};

function resolveTargetLabel(draft: NotificationDraft) {
  if (draft.targetType === "all") {
    return "全体";
  }

  const labels = getTargetCandidates(draft.targetType)
    .filter((candidate) => draft.targetIds.includes(candidate.id))
    .map((candidate) => candidate.label);

  return labels.length > 0 ? labels.join("、") : "未選択";
}

function resolveRecipientCount(draft: NotificationDraft) {
  if (draft.targetType === "all") {
    return 420;
  }

  return getTargetCandidates(draft.targetType)
    .filter((candidate) => draft.targetIds.includes(candidate.id))
    .reduce((sum, candidate) => sum + candidate.recipientCount, 0);
}

export function NotificationPreviewPanel({
  draft,
}: NotificationPreviewPanelProps) {
  const targetOption = getTargetOption(draft.targetType);
  const targetLabel = resolveTargetLabel(draft);
  const recipientCount = resolveRecipientCount(draft);

  return (
    <aside className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-base font-semibold text-[color:var(--text-1)]">
          送信前確認
        </h2>
        <p className="mt-1 text-sm leading-6 text-[color:var(--text-2)]">
          誤送信を防ぐため、送信前に内容と対象者数を確認します。
        </p>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="rounded-xl border border-[color:var(--border-1)] bg-[color:var(--surface-row)] p-3">
          <dt className="text-xs text-[color:var(--text-3)]">対象種別</dt>
          <dd className="mt-1 font-semibold text-[color:var(--text-1)]">
            {targetOption?.label}
          </dd>
        </div>
        <div className="rounded-xl border border-[color:var(--border-1)] bg-[color:var(--surface-row)] p-3">
          <dt className="text-xs text-[color:var(--text-3)]">対象</dt>
          <dd className="mt-1 font-semibold text-[color:var(--text-1)]">
            {targetLabel}
          </dd>
        </div>
        <div className="rounded-xl border border-[color:var(--border-1)] bg-[color:var(--surface-row)] p-3">
          <dt className="text-xs text-[color:var(--text-3)]">対象者数</dt>
          <dd className="mt-1 font-semibold text-[color:var(--text-1)]">
            {recipientCount}件
          </dd>
        </div>
        <div className="rounded-xl border border-[color:var(--border-1)] bg-[color:var(--surface-row)] p-3">
          <dt className="text-xs text-[color:var(--text-3)]">送信方法</dt>
          <dd className="mt-1 font-semibold text-[color:var(--text-1)]">
            即時送信
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-2xl border border-[color:var(--border-2)] bg-[color:var(--surface-2)] p-4">
        <div className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
          プレビュー
        </div>
        <h3 className="mt-2 text-base font-semibold text-[color:var(--text-1)]">
          {draft.title || "件名を入力してください"}
        </h3>
        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-[color:var(--text-2)]">
          {draft.body || "本文を入力すると、ここにプレビューが表示されます。"}
        </p>
      </div>
    </aside>
  );
}

import { useState, type FormEvent } from "react";

import { AdminPageTitle } from "~/features/admin-pages/components/AdminPageTitle";
import { notificationsApi } from "~/features/notifications/api";
import { NotificationPreviewPanel } from "~/features/notifications/components/NotificationPreviewPanel";
import { NotificationTargetSelector } from "~/features/notifications/components/NotificationTargetSelector";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";

function canSubmitNotification(draft: NotificationDraft) {
  const hasTarget = draft.targetType === "all" || draft.targetIds.length > 0;

  return draft.title.trim() !== "" && draft.body.trim() !== "" && hasTarget;
}

export function NotificationCreatePage() {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [lastSubmittedTitle, setLastSubmittedTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = canSubmitNotification(draft);

  const updateDraft = <Key extends keyof NotificationDraft>(
    key: Key,
    value: NotificationDraft[Key]
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
    setLastSubmittedTitle("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await notificationsApi.send(draft);
      setLastSubmittedTitle(draft.title);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <AdminPageTitle
        eyebrow="通知"
        title="通知作成"
        description="手動で送信する通知を作成します。MVPでは全体またはグループ・チーム単位で対象を指定します。"
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="flex flex-col gap-[18px]">
          <section className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
            <div>
              <h2 className="text-base font-semibold text-[color:var(--text-1)]">
                通知内容
              </h2>
              <p className="mt-1 text-sm leading-6 text-[color:var(--text-2)]">
                アプリへ配信する件名と本文を入力します。
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
                  件名
                </span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="例: 集合場所の案内"
                  className="mt-2 h-11 w-full rounded-xl border border-[color:var(--border-2)] bg-[color:var(--surface-1)] px-3 text-sm text-[color:var(--text-1)] outline-none placeholder:text-[color:var(--text-3)] focus:border-[color:var(--brand-1)] focus:ring-4 focus:ring-[color:var(--surface-brand-soft)]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
                  本文
                </span>
                <textarea
                  value={draft.body}
                  onChange={(event) => updateDraft("body", event.target.value)}
                  placeholder="例: 赤チームは体育館前に集合してください。"
                  rows={6}
                  className="mt-2 w-full resize-y rounded-xl border border-[color:var(--border-2)] bg-[color:var(--surface-1)] px-3 py-3 text-sm leading-6 text-[color:var(--text-1)] outline-none placeholder:text-[color:var(--text-3)] focus:border-[color:var(--brand-1)] focus:ring-4 focus:ring-[color:var(--surface-brand-soft)]"
                />
              </label>
            </div>
          </section>

          <NotificationTargetSelector
            selectedTargetIds={draft.targetIds}
            selectedTargetType={draft.targetType}
            onTargetIdsChange={(targetIds) =>
              updateDraft("targetIds", targetIds)
            }
            onTargetTypeChange={(targetType) =>
              updateDraft("targetType", targetType)
            }
          />
        </div>

        <div className="flex flex-col gap-[18px]">
          <NotificationPreviewPanel draft={draft} />

          <section className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-[color:var(--tone-blue-border)] bg-[linear-gradient(135deg,var(--brand-button-1),var(--brand-button-2))] px-4 text-sm font-bold text-[color:var(--brand-button-text)] shadow-[var(--shadow-soft)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
            >
              {isSubmitting ? "確認中..." : "通知を配信する"}
            </button>

            <p className="mt-3 text-xs leading-5 text-[color:var(--text-3)]">
              現時点では画面上の送信確認のみです。実配信は API
              接続時に連携します。
            </p>

            {lastSubmittedTitle ? (
              <div className="mt-4 rounded-xl border border-[color:var(--tone-green-border)] bg-[color:var(--tone-green-bg)] px-3 py-2 text-sm font-semibold text-[color:var(--tone-green-text)]">
                「{lastSubmittedTitle}」を配信対象として確認しました。
              </div>
            ) : null}
          </section>
        </div>
      </form>
    </div>
  );
}

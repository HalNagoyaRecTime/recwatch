import { useMemo, useState } from "react";

import { AdminPageTitle } from "~/features/admin-pages/components/AdminPageTitle";
import { NotificationPreviewPanel } from "~/features/notifications/components/NotificationPreviewPanel";
import { NotificationTargetSelector } from "~/features/notifications/components/NotificationTargetSelector";
import {
  initialNotificationDraft,
  relatedNotificationResources,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";

function canSubmitNotification(draft: NotificationDraft) {
  const hasTarget = draft.targetType === "all" || draft.targetId !== "";

  return draft.title.trim() !== "" && draft.body.trim() !== "" && hasTarget;
}

export function NotificationCreatePage() {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [lastSubmittedTitle, setLastSubmittedTitle] = useState("");

  const canSubmit = useMemo(() => canSubmitNotification(draft), [draft]);

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

  return (
    <div className="page">
      <AdminPageTitle
        eyebrow="通知"
        title="通知作成"
        description="全体・クラス・競技・出場グループなど、大きな単位で対象を指定して通知を作成します。"
      />

      <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_360px]">
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
                  placeholder="例: サッカー A グループ集合"
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
                  placeholder="例: サッカー A グループは10:00にグラウンドへ集合してください。"
                  rows={6}
                  className="mt-2 w-full resize-y rounded-xl border border-[color:var(--border-2)] bg-[color:var(--surface-1)] px-3 py-3 text-sm leading-6 text-[color:var(--text-1)] outline-none placeholder:text-[color:var(--text-3)] focus:border-[color:var(--brand-1)] focus:ring-4 focus:ring-[color:var(--surface-brand-soft)]"
                />
              </label>
            </div>
          </section>

          <NotificationTargetSelector
            selectedTargetId={draft.targetId}
            selectedTargetType={draft.targetType}
            onTargetIdChange={(targetId) => updateDraft("targetId", targetId)}
            onTargetTypeChange={(targetType) =>
              updateDraft("targetType", targetType)
            }
          />

          <section className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
            <div>
              <h2 className="text-base font-semibold text-[color:var(--text-1)]">
                関連情報
              </h2>
              <p className="mt-1 text-sm leading-6 text-[color:var(--text-2)]">
                通知から競技やスケジュールの情報へつなげるための関連情報です。
              </p>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
                関連する競技またはスケジュール
              </span>
              <select
                value={draft.relatedResourceId}
                onChange={(event) =>
                  updateDraft("relatedResourceId", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-xl border border-[color:var(--border-2)] bg-[color:var(--surface-1)] px-3 text-sm text-[color:var(--text-1)] outline-none focus:border-[color:var(--brand-1)] focus:ring-4 focus:ring-[color:var(--surface-brand-soft)]"
              >
                <option value="">指定しない</option>
                {relatedNotificationResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.kind === "competition" ? "競技" : "スケジュール"}:{" "}
                    {resource.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
            <div>
              <h2 className="text-base font-semibold text-[color:var(--text-1)]">
                送信タイミング
              </h2>
              <p className="mt-1 text-sm leading-6 text-[color:var(--text-2)]">
                今回は MVP として即時送信のみ対応します。予約送信は対象外です。
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[color:var(--brand-1)] bg-[color:var(--surface-brand-soft)] p-4">
              <div className="text-sm font-semibold text-[color:var(--text-1)]">
                即時送信
              </div>
              <div className="mt-1 text-xs leading-5 text-[color:var(--text-2)]">
                作成後すぐに指定した対象へ配信します。
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-[18px]">
          <NotificationPreviewPanel draft={draft} />

          <section className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => setLastSubmittedTitle(draft.title)}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-[color:var(--tone-blue-border)] bg-[linear-gradient(135deg,var(--brand-button-1),var(--brand-button-2))] px-4 text-sm font-bold text-[color:var(--brand-button-text)] shadow-[var(--shadow-soft)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
            >
              通知を配信する
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
      </div>
    </div>
  );
}

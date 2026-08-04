import { useState, type FormEvent } from "react";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

import { NotificationForm } from "../components/NotificationForm";
import { NotificationPhonePreview } from "../components/NotificationPhonePreview";
import { NotificationSummary } from "../components/NotificationSummary";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationSubmissionApi } from "~/features/notifications/api/contracts/notification-submission-api";
import { useNotificationCreate } from "~/features/notifications/hooks/useNotificationCreate";

function formatPreviewDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);
}

function formatPreviewTime(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

type NotificationCreatePageProps = {
  api: NotificationSubmissionApi;
  audienceApi: NotificationAudienceApi;
  isSubmissionEnabled?: boolean;
};

export function NotificationCreatePage({
  api,
  audienceApi,
  isSubmissionEnabled = true,
}: NotificationCreatePageProps) {
  const [previewDate] = useState(() => new Date());

  const {
    audienceError,
    audienceOptions,
    draft,
    errors,
    isAudienceLoading,
    isSubmitting,
    onAudienceReload,
    onChange,
    submitted,
    submissionError,
    submit,
  } = useNotificationCreate({ api, audienceApi, isSubmissionEnabled });

  const previewTime = previewDate ? formatPreviewTime(previewDate) : "--:--";
  const previewDateLabel = previewDate
    ? formatPreviewDate(previewDate)
    : "----/--/--";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit();
  }

  return (
    <PageLayout>
      <PagePadding>
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="grid gap-10 xl:grid-cols-[minmax(420px,1fr)_minmax(480px,1.05fr)]">
            <section className="min-w-0">
              <h1 className="text-xl font-semibold">通知作成</h1>
              <p className="mt-4 text-sm text-[color:var(--text-3)]">
                生徒や関係者に配信するプッシュ通知を作成します
              </p>
              <div className="mt-5 max-w-[560px]">
                <NotificationForm
                  draft={draft}
                  errors={errors}
                  audienceOptions={audienceOptions}
                  isAudienceLoading={isAudienceLoading}
                  audienceError={audienceError}
                  isSubmissionDisabled={!isSubmissionEnabled}
                  isSubmitting={isSubmitting}
                  onChange={onChange}
                  onSubmit={handleSubmit}
                  onAudienceReload={onAudienceReload}
                />
              </div>
              <div
                aria-live="polite"
                className={`mt-4 min-h-5 text-sm ${
                  submissionError
                    ? "text-red-600"
                    : "text-[color:var(--tone-green-text)]"
                }`}
              >
                {!isSubmissionEnabled
                  ? "API接続後に通知を配信できます。"
                  : (submissionError ??
                    (submitted ? "通知を配信予定に登録しました。" : null))}
              </div>
            </section>

            <section className="min-w-0 pt-9">
              <NotificationSummary
                draft={draft}
                deliveryTime={previewTime}
                audienceOptions={audienceOptions}
              />
              <div className="mt-5">
                <NotificationPhonePreview
                  title={draft.title}
                  body={draft.body}
                  time={previewTime}
                  date={previewDateLabel}
                />
              </div>
            </section>
          </div>
        </div>
      </PagePadding>
    </PageLayout>
  );
}

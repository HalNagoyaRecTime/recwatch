import type { FormEvent } from "react";

import { PageHeader } from "~/components/ui/layout/PageHeader";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationSubmissionApi } from "~/features/notifications/api/contracts/notification-submission-api";
import { NotificationForm } from "~/features/notifications/components/NotificationForm";
import { NotificationPreviewPanel } from "~/features/notifications/components/NotificationPreviewPanel";
import { useNotificationCreate } from "~/features/notifications/hooks/useNotificationCreate";

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
  const state = useNotificationCreate({
    api,
    audienceApi,
    isSubmissionEnabled,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void state.submit();
  }

  return (
    <PageLayout right={<NotificationPreviewPanel draft={state.draft} />}>
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            title="通知を作成"
            description="アプリを利用するメンバーへプッシュ通知を配信します"
          />
          <NotificationForm
            audienceError={state.audienceError}
            audienceOptions={state.audienceOptions}
            draft={state.draft}
            errors={state.errors}
            isAudienceLoading={state.isAudienceLoading}
            isSubmissionDisabled={!isSubmissionEnabled}
            isSubmitting={state.isSubmitting}
            onAudienceReload={state.onAudienceReload}
            onChange={state.onChange}
            onSubmit={handleSubmit}
          />
          <div
            aria-live="polite"
            className={`min-h-5 text-sm ${
              state.submissionError
                ? "text-tone-danger-text"
                : "text-tone-success-text"
            }`}
          >
            {!isSubmissionEnabled
              ? "API接続後に通知を配信できます。"
              : (state.submissionError ??
                (state.submitted ? "通知を配信予定に登録しました。" : null))}
          </div>
        </div>
      </PagePadding>
    </PageLayout>
  );
}

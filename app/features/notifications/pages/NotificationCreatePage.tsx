import { formatNotificationSubmissionErrors } from "~/features/notifications/components/notification-display";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { NotificationEditorLayout } from "~/features/notifications/components/form/NotificationEditorLayout";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import { NotificationForm } from "~/features/notifications/components/form/NotificationForm";
import { useNotificationCreate } from "~/features/notifications/hooks/useNotificationCreate";
import type { NotificationFeedbackReporter } from "~/features/notifications/hooks/notification-feedback";
import { useNavigate } from "react-router";

type NotificationCreatePageProps = {
  api: AdminNotificationCommandApi;
  audienceApi: NotificationAudienceApi;
  configApi: NotificationConfigApi;
  isSubmissionEnabled?: boolean;
  reportFeedback?: NotificationFeedbackReporter;
};

export function NotificationCreatePage({
  api,
  audienceApi,
  configApi,
  isSubmissionEnabled = true,
  reportFeedback,
}: NotificationCreatePageProps) {
  const navigate = useNavigate();
  const state = useNotificationCreate({
    api,
    audienceApi,
    configApi,
    isSubmissionEnabled,
    reportFeedback,
  });

  const submissionError = formatNotificationSubmissionErrors(
    state.submissionIssues,
    state.submissionError
  );

  return (
    <NotificationEditorLayout
      draft={state.draft}
      audienceOptions={state.audienceOptions}
    >
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            title="通知を作成"
            description="アプリを利用するユーザーへプッシュ通知を配信します"
          />
          <NotificationForm
            canSubmit={state.canSubmit}
            audienceError={state.audienceError}
            audienceOptions={state.audienceOptions}
            configError={state.configError}
            draft={state.draft}
            errors={state.errors}
            isAudienceLoading={state.isAudienceLoading}
            importanceOptions={state.importanceOptions}
            isRecipientCountLoading={state.isRecipientCountLoading}
            isSubmitting={state.isSubmitting}
            onAudienceReload={state.onAudienceReload}
            onChange={state.onChange}
            onSubmit={async () => {
              const result = await state.submit();
              if (result) navigate(`/notifications/${result.notificationId}`);
            }}
            recipientCount={state.recipientCount}
            recipientCountError={state.recipientCountError}
          />
          <div
            aria-live="polite"
            className={`min-h-5 text-sm ${
              submissionError
                ? "text-tone-danger-text"
                : "text-tone-success-text"
            }`}
          >
            {!isSubmissionEnabled
              ? "API接続後に通知を配信できます。"
              : (submissionError ??
                (state.submitted ? "通知を配信予定に登録しました。" : null))}
          </div>
        </div>
      </PagePadding>
    </NotificationEditorLayout>
  );
}

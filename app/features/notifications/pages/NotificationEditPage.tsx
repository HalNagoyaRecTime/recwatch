import { useNavigate } from "react-router";

import { PageHeader } from "~/components/ui/layout/PageHeader";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import { NotificationForm } from "~/features/notifications/components/form/NotificationForm";
import { NotificationPreviewPanel } from "~/features/notifications/components/preview/NotificationPreviewPanel";
import type { NotificationFeedbackReporter } from "~/features/notifications/hooks/notification-feedback";
import { useNotificationEdit } from "~/features/notifications/hooks/useNotificationEdit";

type NotificationEditPageProps = {
  audienceApi: NotificationAudienceApi;
  commandApi: AdminNotificationCommandApi;
  configApi: NotificationConfigApi;
  notificationId: number;
  queryApi: AdminNotificationQueryApi;
  reportFeedback?: NotificationFeedbackReporter;
};

export function NotificationEditPage(props: NotificationEditPageProps) {
  const navigate = useNavigate();
  const state = useNotificationEdit(props);

  if (state.isLoading) {
    return <PagePadding>通知を読み込み中...</PagePadding>;
  }
  if (state.loadError) {
    return (
      <PagePadding>
        <p className="text-tone-danger-text">{state.loadError}</p>
      </PagePadding>
    );
  }

  return (
    <PageLayout right={<NotificationPreviewPanel draft={state.draft} />}>
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            title="通知を編集"
            description={
              state.canEditAudience
                ? "通知内容・対象・配信設定を変更できます"
                : "配信開始後は通知詳細のみ変更できます"
            }
          />
          <NotificationForm
            audienceError={state.audienceError}
            audienceOptions={state.audienceOptions}
            cancelTo={`/notifications/${props.notificationId}`}
            configError={state.configError}
            draft={state.draft}
            errors={state.errors}
            importanceOptions={state.importanceOptions}
            isAudienceDisabled={!state.canEditAudience}
            isAudienceLoading={state.isAudienceLoading}
            isFullEditDisabled={!state.canEditAudience}
            isRecipientCountLoading={state.isRecipientCountLoading}
            isSubmitting={state.isSubmitting}
            onAudienceReload={state.onAudienceReload}
            onChange={state.onChange}
            onSubmit={async () => {
              if (await state.submit()) {
                navigate(`/notifications/${props.notificationId}`);
              }
            }}
            recipientCount={state.recipientCount}
            recipientCountError={state.recipientCountError}
            submitLabel="変更を保存"
          />
          {state.submissionError ? (
            <p className="text-tone-danger-text text-sm" aria-live="polite">
              {state.submissionError}
            </p>
          ) : null}
        </div>
      </PagePadding>
    </PageLayout>
  );
}

import { useNavigate } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { NotificationForm } from "~/features/notifications/components/NotificationForm";
import { NotificationPreviewPanel } from "~/features/notifications/components/NotificationPreviewPanel";
import { useNotificationEdit } from "~/features/notifications/hooks/useNotificationEdit";
import { notificationManagementErrorMessages } from "~/features/notifications/model/notification-management-error";

type NotificationEditPageProps = {
  notificationId: number;
  api: NotificationManagementApi;
  audienceApi: NotificationAudienceApi;
};

export function NotificationEditPage({
  notificationId,
  api,
  audienceApi,
}: NotificationEditPageProps) {
  const navigate = useNavigate();
  const state = useNotificationEdit({ api, audienceApi, notificationId });

  async function handleSubmit() {
    const updated = await state.submit();
    if (updated) {
      navigate("/notifications");
    }
  }

  return (
    <PageLayout right={<NotificationPreviewPanel draft={state.draft} />}>
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            title="通知を編集"
            description="通知内容と配信対象を編集します"
          />

          {state.isLoading ? (
            <div aria-live="polite" className="text-text-muted text-sm">
              通知を読み込み中...
            </div>
          ) : state.loadError || !state.notification ? (
            <div aria-live="polite" className="space-y-3" role="alert">
              <p className="text-tone-danger-text text-sm">
                {state.loadError ??
                  notificationManagementErrorMessages.unexpected}
              </p>
              <ButtonLink to="/notifications" size="md" variant="secondary">
                通知一覧へ戻る
              </ButtonLink>
            </div>
          ) : (
            <>
              {!state.isEditable ? (
                <p className="text-tone-danger-text text-sm" role="alert">
                  {notificationManagementErrorMessages.conflict}
                </p>
              ) : null}
              {!state.canEditAudience ? (
                <p className="text-text-muted text-sm">
                  この通知は配信対象を変更できません。タイトル・本文・配信日時のみ編集できます。
                </p>
              ) : null}
              <NotificationForm
                audienceError={state.audienceError}
                audienceOptions={state.audienceOptions}
                cancelTo="/notifications"
                draft={state.draft}
                errors={state.errors}
                isAudienceDisabled={!state.canEditAudience}
                isAudienceLoading={state.isAudienceLoading}
                isSubmissionDisabled={!state.isEditable}
                isSubmitting={state.isSubmitting}
                onAudienceReload={state.onAudienceReload}
                onChange={state.onChange}
                onSubmit={handleSubmit}
                submitLabel="変更を保存"
              />
              <div
                aria-live="polite"
                className="text-tone-danger-text min-h-5 text-sm"
              >
                {state.submissionError}
              </div>
            </>
          )}
        </div>
      </PagePadding>
    </PageLayout>
  );
}

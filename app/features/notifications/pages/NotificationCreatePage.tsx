import { useState } from "react";

import { PageHeader } from "~/components/ui/layout/PageHeader";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { NotificationForm } from "~/features/notifications/components/form/NotificationForm";
import { NotificationPreviewPanel } from "~/features/notifications/components/preview/NotificationPreviewPanel";
import { notificationDesignTargetOptions } from "~/features/notifications/model/notification-design-data";
import {
  initialNotificationDesignDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "~/features/notifications/model/notification-draft-validation";

export function NotificationCreatePage({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDesignDraft
  );
  const [errors, setErrors] = useState<NotificationDraftErrors>({});

  function handleChange(nextDraft: NotificationDraft) {
    setDraft(nextDraft);
    setErrors((current) => ({
      ...current,
      pushTitle: nextDraft.pushTitle?.trim() ? undefined : current.pushTitle,
      pushBody: nextDraft.pushBody?.trim() ? undefined : current.pushBody,
      title: nextDraft.title.trim() ? undefined : current.title,
      markdownDescription: nextDraft.markdownDescription?.trim()
        ? undefined
        : current.markdownDescription,
      importance: nextDraft.importance ? undefined : current.importance,
      audienceId:
        nextDraft.audienceScope === "specified"
          ? nextDraft.targetSelections?.length
            ? undefined
            : current.audienceId
          : nextDraft.audienceId
            ? undefined
            : current.audienceId,
      scheduledAt: nextDraft.scheduledAt ? undefined : current.scheduledAt,
    }));
  }

  function handleSubmit() {
    setErrors(validateNotificationDraft(draft));
  }

  return (
    <PageLayout right={<NotificationPreviewPanel draft={draft} />}>
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            title={mode === "edit" ? "通知を編集" : "通知を作成"}
            description="アプリを利用するメンバーへプッシュ通知を配信します"
          />
          <NotificationForm
            targetOptions={[...notificationDesignTargetOptions]}
            draft={draft}
            errors={errors}
            isSubmissionDisabled
            isSubmitting={false}
            onChange={handleChange}
            onSubmit={handleSubmit}
            showSubmitIcon={false}
            submitLabel="通知を作成"
          />
        </div>
      </PagePadding>
    </PageLayout>
  );
}

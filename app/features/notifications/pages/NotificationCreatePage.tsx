import { useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "~/components/ui/layout/PageHeader";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import type { NotificationAudienceLoader } from "../application/notification-audience-loader";
import {
  NotificationAudienceLoadingError,
  notificationAudienceLoadingErrorMessages,
} from "../application/notification-audience-loading-error";
import type { NotificationSubmitter } from "../application/notification-submitter";
import {
  NotificationSubmissionError,
  notificationSubmissionErrorMessages,
} from "../application/notification-submission-error";
import { NotificationForm } from "../components/NotificationForm";
import { NotificationPreviewPanel } from "../components/NotificationPreviewPanel";
import type { NotificationAudienceOption } from "../model/notification-audience-option";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "../model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "../model/notification-draft-validation";

type NotificationCreatePageProps = {
  submitter: NotificationSubmitter;
  audienceLoader: NotificationAudienceLoader;
  isSubmissionEnabled?: boolean;
};

export function NotificationCreatePage({
  submitter,
  audienceLoader,
  isSubmissionEnabled = true,
}: NotificationCreatePageProps) {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [audienceOptions, setAudienceOptions] = useState<
    NotificationAudienceOption[]
  >([]);
  const [isAudienceLoading, setIsAudienceLoading] = useState(true);
  const [audienceError, setAudienceError] = useState<string | null>(null);
  const [audienceReloadKey, setAudienceReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsAudienceLoading(true);
    setAudienceError(null);

    audienceLoader
      .load()
      .then((options) => {
        if (active) {
          setAudienceOptions(options);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAudienceOptions([]);
          setAudienceError(
            error instanceof NotificationAudienceLoadingError
              ? notificationAudienceLoadingErrorMessages[error.kind]
              : notificationAudienceLoadingErrorMessages.unexpected
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsAudienceLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [audienceLoader, audienceReloadKey]);

  function handleChange(nextDraft: NotificationDraft) {
    setDraft(nextDraft);
    setSubmitted(false);
    setSubmissionError(null);
    setErrors((current) => ({
      ...current,
      title: nextDraft.title.trim() ? undefined : current.title,
      body: nextDraft.body.trim() ? undefined : current.body,
      audienceId: nextDraft.audienceId ? undefined : current.audienceId,
      scheduledAt: nextDraft.scheduledAt ? undefined : current.scheduledAt,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSubmissionEnabled) {
      return;
    }

    const nextErrors = validateNotificationDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitted(false);
    setSubmissionError(null);

    try {
      await submitter.submit(draft);
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(
        error instanceof NotificationSubmissionError
          ? notificationSubmissionErrorMessages[error.kind]
          : notificationSubmissionErrorMessages.unexpected
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageLayout right={<NotificationPreviewPanel draft={draft} />}>
      <PagePadding>
        <div className="mx-auto flex w-full min-w-0 flex-col gap-6">
          <PageHeader
            title="通知を作成"
            description="アプリを利用するメンバーへプッシュ通知を配信します"
          />
          <NotificationForm
            draft={draft}
            errors={errors}
            audienceOptions={audienceOptions}
            audienceError={audienceError}
            isAudienceLoading={isAudienceLoading}
            isSubmissionDisabled={!isSubmissionEnabled}
            isSubmitting={isSubmitting}
            onAudienceReload={() =>
              setAudienceReloadKey((current) => current + 1)
            }
            onChange={handleChange}
            onSubmit={handleSubmit}
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
                (submitted ? "通知を配信予定に登録しました。" : null))}
          </div>
        </div>
      </PagePadding>
    </PageLayout>
  );
}

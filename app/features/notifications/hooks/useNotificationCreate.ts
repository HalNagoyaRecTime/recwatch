import { useEffect, useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import { toNotificationCreateRequest } from "~/features/notifications/api/mappers/admin-notification-request-mapper";
import { getErrorMessage } from "~/lib/client-error";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "~/features/notifications/model/notification-draft-validation";
import {
  reportNotificationActionError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";

type UseNotificationCreateOptions = {
  api: AdminNotificationCommandApi;
  audienceApi: NotificationAudienceApi;
  isSubmissionEnabled?: boolean;
  reportFeedback?: NotificationFeedbackReporter;
};

export function useNotificationCreate({
  api,
  audienceApi,
  isSubmissionEnabled = true,
  reportFeedback,
}: UseNotificationCreateOptions) {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [audienceReloadKey, setAudienceReloadKey] = useState(0);
  const [audienceResult, setAudienceResult] = useState<{
    api: NotificationAudienceApi;
    reloadKey: number;
    options: NotificationAudienceOption[];
    error: string | null;
  } | null>(null);

  const hasCurrentAudienceResult =
    audienceResult?.api === audienceApi &&
    audienceResult.reloadKey === audienceReloadKey;
  const audienceOptions = audienceResult?.options ?? [];
  const isAudienceLoading = !hasCurrentAudienceResult;
  const audienceError = hasCurrentAudienceResult ? audienceResult.error : null;

  useEffect(() => {
    let active = true;

    audienceApi
      .load()
      .then((options) => {
        if (active) {
          setAudienceResult({
            api: audienceApi,
            reloadKey: audienceReloadKey,
            options,
            error: null,
          });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAudienceResult({
            api: audienceApi,
            reloadKey: audienceReloadKey,
            options: [],
            error: toAudienceErrorMessage(error),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [audienceApi, audienceReloadKey]);

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

  async function submit() {
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
      await api.create(toNotificationCreateRequest(draft));
      setSubmitted(true);
      reportFeedback?.({
        kind: "action-success",
        title: "通知を登録しました",
        message: "通知を配信予定に登録しました。",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setSubmissionError(message);
      reportNotificationActionError(reportFeedback, {
        title: "通知を登録できませんでした",
        message,
        action: "notification.create",
        endpoint: "/api/v1/admin/notifications",
        error,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    audienceError,
    audienceOptions,
    draft,
    errors,
    isAudienceLoading,
    isSubmitting,
    onAudienceReload: () => setAudienceReloadKey((current) => current + 1),
    onChange: handleChange,
    submitted,
    submissionError,
    submit,
  };
}

function toAudienceErrorMessage(error: unknown) {
  return getErrorMessage(error);
}

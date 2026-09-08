import { useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationSubmissionApi } from "~/features/notifications/api/contracts/notification-submission-api";
import { getErrorMessage } from "~/lib/client-error";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "~/features/notifications/model/notification-draft-validation";
import { useNotificationAudienceOptions } from "~/features/notifications/hooks/useNotificationAudienceOptions";

type UseNotificationCreateOptions = {
  api: NotificationSubmissionApi;
  audienceApi: NotificationAudienceApi;
  isSubmissionEnabled?: boolean;
};

export function useNotificationCreate({
  api,
  audienceApi,
  isSubmissionEnabled = true,
}: UseNotificationCreateOptions) {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    audienceError,
    audienceOptions,
    isAudienceLoading,
    reloadAudience,
  } = useNotificationAudienceOptions(audienceApi);

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
      await api.submit(draft);
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(getErrorMessage(error));
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
    onAudienceReload: reloadAudience,
    onChange: handleChange,
    submitted,
    submissionError,
    submit,
  };
}

import { useEffect, useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationSubmissionApi } from "~/features/notifications/api/contracts/notification-submission-api";
import { NotificationAudienceLoadingError } from "~/features/notifications/api/contracts/errors/notification-audience-loading-error";
import { NotificationSubmissionError } from "~/features/notifications/api/contracts/errors/notification-submission-error";
import {
  getNotificationAudienceLoadingErrorMessage,
  getNotificationSubmissionErrorMessage,
} from "~/features/notifications/hooks/notification-error-messages";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "~/features/notifications/model/notification-draft-validation";

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

    audienceApi
      .load()
      .then((options) => {
        if (active) {
          setAudienceOptions(options);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAudienceOptions([]);
          setAudienceError(toAudienceErrorMessage(error));
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
      await api.submit(draft);
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(
        getNotificationSubmissionErrorMessage(
          error instanceof NotificationSubmissionError
            ? error.kind
            : "unexpected"
        )
      );
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
  return getNotificationAudienceLoadingErrorMessage(
    error instanceof NotificationAudienceLoadingError
      ? error.kind
      : "unexpected"
  );
}

import { useNotificationFormResources } from "~/features/notifications/hooks/useNotificationFormResources";
import { useNotificationFormErrors } from "~/features/notifications/hooks/useNotificationFormErrors";
import { isNotificationFormReady } from "~/features/notifications/hooks/notification-form-readiness";
import { useRef, useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import { readNotificationValidationDetails } from "~/features/notifications/api/contracts/notification-error";
import {
  toNotificationFormErrors,
  toNotificationValidationErrors,
  type NotificationFormIssue,
} from "~/features/notifications/hooks/notification-form-errors";
import { toNotificationCreateRequest } from "~/features/notifications/hooks/notification-request-mapping";
import { getErrorMessage } from "~/lib/client-error";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import { validateNotificationDraft } from "~/features/notifications/model/notification-draft-validation";
import {
  reportNotificationActionError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";

type UseNotificationCreateOptions = {
  api: AdminNotificationCommandApi;
  audienceApi: NotificationAudienceApi;
  configApi: NotificationConfigApi;
  isSubmissionEnabled?: boolean;
  reportFeedback?: NotificationFeedbackReporter;
};

export function useNotificationCreate({
  api,
  audienceApi,
  configApi,
  isSubmissionEnabled = true,
  reportFeedback,
}: UseNotificationCreateOptions) {
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const { errors, setErrors, updateDraftErrors } = useNotificationFormErrors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionIssues, setSubmissionIssues] = useState<
    NotificationFormIssue[]
  >([]);
  const resources = useNotificationFormResources({
    audienceApi,
    configApi,
    audiences: draft.audiences,
  });
  function handleChange(nextDraft: NotificationDraft) {
    setDraft(nextDraft);
    setSubmitted(false);
    setSubmissionError(null);
    setSubmissionIssues([]);
    updateDraftErrors(nextDraft);
  }

  async function submit() {
    if (!isSubmissionEnabled) {
      return null;
    }

    const nextErrors = validateNotificationDraft(draft);
    setErrors(toNotificationValidationErrors(nextErrors));

    if (Object.keys(nextErrors).length > 0 || submitting.current) {
      return null;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setSubmitted(false);
    setSubmissionError(null);
    setSubmissionIssues([]);

    try {
      const result = await api.create(toNotificationCreateRequest(draft));
      setSubmitted(true);
      reportFeedback?.({
        kind: "action-success",
        title: "通知を登録しました",
        message: "通知を配信予定に登録しました。",
      });
      return result;
    } catch (error) {
      const details = readNotificationValidationDetails(error);
      const message = getErrorMessage(error);
      if (details) {
        const converted = toNotificationFormErrors(details);
        setErrors((current) => ({ ...current, ...converted.fieldErrors }));
        setSubmissionIssues(converted.formErrors);
        setSubmissionError(message);
      } else setSubmissionError(message);
      if (!details)
        reportNotificationActionError(reportFeedback, {
          title: "通知を登録できませんでした",
          message,
          action: "notification.create",
          endpoint: "/api/v1/admin/notifications",
          error,
        });
      return null;
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    ...resources,
    canSubmit:
      isSubmissionEnabled && isNotificationFormReady(draft, false, resources),
    draft,
    errors,
    isSubmitting,
    onChange: handleChange,
    submitted,
    submissionError,
    submissionIssues,
    submit,
  };
}

import { useEffect, useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import {
  toNotificationAudienceInput,
  toNotificationCreateRequest,
} from "~/features/notifications/api/mappers/admin-notification-request-mapper";
import { readNotificationValidationDetails } from "~/features/notifications/api/mappers/notification-api-error-mapper";
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
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [audienceReloadKey, setAudienceReloadKey] = useState(0);
  const [importanceOptions, setImportanceOptions] = useState<
    NotificationDraft["importance"][]
  >([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [isRecipientCountLoading, setIsRecipientCountLoading] = useState(false);
  const [recipientCountError, setRecipientCountError] = useState<string | null>(
    null
  );
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

  useEffect(() => {
    let active = true;
    configApi
      .getConfig()
      .then((config) => {
        if (!active) return;
        setImportanceOptions(config.importance.options);
        setDraft((current) => ({
          ...current,
          importance: config.importance.default,
        }));
        setConfigError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setImportanceOptions([]);
        setConfigError(getErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [configApi]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      setIsRecipientCountLoading(true);
      setRecipientCountError(null);
      try {
        const audience = toNotificationAudienceInput(draft.audiences);
        void configApi
          .getAudienceCount({ audience })
          .then((result) => {
            if (active) setRecipientCount(result.recipientCount);
          })
          .catch((error: unknown) => {
            if (!active) return;
            setRecipientCountError(getErrorMessage(error));
          })
          .finally(() => {
            if (active) setIsRecipientCountLoading(false);
          });
      } catch {
        setRecipientCount(null);
        setIsRecipientCountLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [configApi, draft.audiences]);

  function handleChange(nextDraft: NotificationDraft) {
    setDraft(nextDraft);
    setSubmitted(false);
    setSubmissionError(null);
    setErrors((current) => ({
      ...current,
      title: nextDraft.title.trim() ? undefined : current.title,
      body: nextDraft.body.trim() ? undefined : current.body,
      detailTitle: nextDraft.detailTitle.trim()
        ? undefined
        : current.detailTitle,
      detailBody: nextDraft.detailBody.trim() ? undefined : current.detailBody,
      audiences: nextDraft.audiences.length ? undefined : current.audiences,
      scheduledAt: nextDraft.scheduledAt ? undefined : current.scheduledAt,
    }));
  }

  async function submit() {
    if (!isSubmissionEnabled) {
      return null;
    }

    const nextErrors = validateNotificationDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isSubmitting) {
      return null;
    }

    setIsSubmitting(true);
    setSubmitted(false);
    setSubmissionError(null);

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
      if (details) {
        setErrors((current) => ({
          ...current,
          title:
            details.fieldErrors["content.push.title"]?.[0] ??
            details.fieldErrors.title?.[0],
          body:
            details.fieldErrors["content.push.body"]?.[0] ??
            details.fieldErrors.body?.[0],
          detailTitle: details.fieldErrors["content.detail.title"]?.[0],
          detailBody: details.fieldErrors["content.detail.body"]?.[0],
          audiences: details.fieldErrors.audience?.[0],
          scheduledAt: details.fieldErrors.delivery?.[0],
          importance: details.fieldErrors.importance?.[0],
        }));
      }
      const message = getErrorMessage(error);
      setSubmissionError(message);
      reportNotificationActionError(reportFeedback, {
        title: "通知を登録できませんでした",
        message,
        action: "notification.create",
        endpoint: "/api/v1/admin/notifications",
        error,
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    audienceError,
    audienceOptions,
    configError,
    draft,
    errors,
    isAudienceLoading,
    importanceOptions,
    isRecipientCountLoading,
    isSubmitting,
    onAudienceReload: () => setAudienceReloadKey((current) => current + 1),
    onChange: handleChange,
    recipientCount,
    recipientCountError,
    submitted,
    submissionError,
    submit,
  };
}

function toAudienceErrorMessage(error: unknown) {
  return getErrorMessage(error);
}

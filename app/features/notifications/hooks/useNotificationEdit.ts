import { useNotificationFormResources } from "~/features/notifications/hooks/useNotificationFormResources";
import { useNotificationFormErrors } from "~/features/notifications/hooks/useNotificationFormErrors";
import { isNotificationFormReady } from "~/features/notifications/hooks/notification-form-readiness";
import { toNotificationDraft } from "~/features/notifications/hooks/notification-draft-mapping";
import { canEditNotificationSchedule } from "~/features/notifications/model/notification-edit-policy";
import { useEffect, useRef, useState } from "react";

import type {
  AdminNotificationCommandApi,
  AdminNotificationDetail,
} from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import {
  readApiErrorStatus,
  readNotificationValidationDetails,
} from "~/features/notifications/api/contracts/notification-error";
import {
  toNotificationFormErrors,
  toNotificationValidationErrors,
  type NotificationFormIssue,
} from "~/features/notifications/hooks/notification-form-errors";
import { toNotificationPatchRequest } from "~/features/notifications/hooks/notification-request-mapping";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import { validateNotificationDraft } from "~/features/notifications/model/notification-draft-validation";
import { getErrorMessage } from "~/lib/client-error";
import {
  reportNotificationActionError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";

type UseNotificationEditOptions = {
  audienceApi: NotificationAudienceApi;
  commandApi: AdminNotificationCommandApi;
  configApi: NotificationConfigApi;
  queryApi: AdminNotificationQueryApi;
  notificationId: number;
  reportFeedback?: NotificationFeedbackReporter;
};

type NotificationEditResult =
  | {
      api: AdminNotificationQueryApi;
      notificationId: number;
      status: "loaded";
      notification: AdminNotificationDetail;
      draft: NotificationDraft;
    }
  | {
      api: AdminNotificationQueryApi;
      notificationId: number;
      status: "error";
      error: string;
    };

export function useNotificationEdit({
  audienceApi,
  commandApi,
  configApi,
  queryApi,
  notificationId,
  reportFeedback,
}: UseNotificationEditOptions) {
  const [notificationResult, setNotificationResult] =
    useState<NotificationEditResult | null>(null);
  const { errors, setErrors, updateDraftErrors } = useNotificationFormErrors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionIssues, setSubmissionIssues] = useState<
    NotificationFormIssue[]
  >([]);
  const isValidNotificationId =
    Number.isSafeInteger(notificationId) && notificationId > 0;
  const currentNotificationResult =
    notificationResult?.api === queryApi &&
    notificationResult.notificationId === notificationId
      ? notificationResult
      : null;
  const notification =
    currentNotificationResult?.status === "loaded"
      ? currentNotificationResult.notification
      : null;
  const draft =
    currentNotificationResult?.status === "loaded"
      ? currentNotificationResult.draft
      : initialNotificationDraft;
  const isLoading = isValidNotificationId && currentNotificationResult === null;
  const loadError = !isValidNotificationId
    ? "通知IDが不正です。"
    : currentNotificationResult?.status === "error"
      ? currentNotificationResult.error
      : null;
  const resources = useNotificationFormResources({
    audienceApi,
    configApi,
    audiences: draft.audiences,
    countEnabled: Boolean(notification),
  });

  useEffect(() => {
    if (!isValidNotificationId) return;

    let active = true;

    queryApi
      .getDetail(notificationId)
      .then((loadedNotification) => {
        if (!active) return;
        setNotificationResult({
          api: queryApi,
          notificationId,
          status: "loaded",
          notification: loadedNotification,
          draft: toNotificationDraft(loadedNotification),
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setNotificationResult({
          api: queryApi,
          notificationId,
          status: "error",
          error: getErrorMessage(error),
        });
      });

    return () => {
      active = false;
    };
  }, [isValidNotificationId, notificationId, queryApi]);

  function handleChange(nextDraft: NotificationDraft) {
    setNotificationResult((current) =>
      current?.api === queryApi &&
      current.notificationId === notificationId &&
      current.status === "loaded"
        ? { ...current, draft: nextDraft }
        : current
    );
    setSubmissionError(null);
    setSubmissionIssues([]);
    updateDraftErrors(nextDraft);
  }

  async function submit() {
    if (!notification || submitting.current) return false;

    const nextErrors = validateNotificationDraft(
      draft,
      new Date(),
      !canEditNotificationSchedule(notification.schedules)
    );
    setErrors(toNotificationValidationErrors(nextErrors));
    if (Object.keys(nextErrors).length > 0) return false;

    const request = toNotificationPatchRequest(notification, draft);
    if (!request) return false;

    submitting.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionIssues([]);
    try {
      const updated = await commandApi.patch(
        notification.notificationId,
        request
      );
      setNotificationResult({
        api: queryApi,
        notificationId,
        status: "loaded",
        notification: updated,
        draft: toNotificationDraft(updated),
      });
      reportFeedback?.({
        kind: "action-success",
        title: "通知を更新しました",
        message: "通知の変更を保存しました。",
      });
      return true;
    } catch (error) {
      if (readApiErrorStatus(error) === 409) {
        try {
          const latest = await queryApi.getDetail(notificationId);
          setNotificationResult((current) =>
            current?.api === queryApi &&
            current.notificationId === notificationId &&
            current.status === "loaded"
              ? {
                  ...current,
                  notification: latest,
                  draft: canEditNotificationSchedule(latest.schedules)
                    ? current.draft
                    : {
                        ...toNotificationDraft(latest),
                        detailTitle: current.draft.detailTitle,
                        detailBody: current.draft.detailBody,
                      },
                }
              : current
          );
        } catch {
          // 取得失敗時も入力を保持し、次の保存で再取得を試みます。
        }
      }
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
          title: "通知を更新できませんでした",
          message,
          action: "notification.patch",
          endpoint: `/api/v1/admin/notifications/${notification.notificationId}`,
          error,
        });
      return false;
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  const canEditAudience = notification
    ? canEditNotificationSchedule(notification.schedules)
    : false;

  return {
    ...resources,
    canSubmit:
      Boolean(notification) &&
      isNotificationFormReady(draft, !canEditAudience, resources),
    canEditAudience,
    draft,
    errors,
    isEditable: Boolean(notification),
    isLoading,
    isSubmitting,
    loadError,
    notification,
    onChange: handleChange,
    submissionError,
    submissionIssues,
    submit,
  };
}

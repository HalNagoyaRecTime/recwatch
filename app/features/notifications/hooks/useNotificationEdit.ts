import { useEffect, useRef, useState } from "react";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import { toNotificationAudienceInput } from "~/features/notifications/api/mappers/admin-notification-request-mapper";
import type {
  AdminNotificationDetail,
  NotificationPatchRequest,
} from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "~/features/notifications/model/notification-draft-validation";
import { getErrorMessage } from "~/lib/client-error";
import { readNotificationValidationDetails } from "~/features/notifications/api/mappers/notification-api-error-mapper";
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
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
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
  const hasCurrentAudienceResult =
    audienceResult?.api === audienceApi &&
    audienceResult.reloadKey === audienceReloadKey;
  const audienceOptions = audienceResult?.options ?? [];
  const isAudienceLoading = !hasCurrentAudienceResult;
  const audienceError = hasCurrentAudienceResult ? audienceResult.error : null;

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

  useEffect(() => {
    let active = true;
    audienceApi
      .load()
      .then((options) => {
        if (!active) return;
        setAudienceResult({
          api: audienceApi,
          reloadKey: audienceReloadKey,
          options,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAudienceResult({
          api: audienceApi,
          reloadKey: audienceReloadKey,
          options: [],
          error: getErrorMessage(error),
        });
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
        setConfigError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setConfigError(getErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [configApi]);

  useEffect(() => {
    if (!notification) return;
    let active = true;
    const timeoutId = window.setTimeout(() => {
      setIsRecipientCountLoading(true);
      setRecipientCountError(null);
      try {
        void configApi
          .getAudienceCount({
            audience: toNotificationAudienceInput(draft.audiences),
          })
          .then((result) => {
            if (active) setRecipientCount(result.recipientCount);
          })
          .catch((error: unknown) => {
            if (active) setRecipientCountError(getErrorMessage(error));
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
  }, [configApi, draft.audiences, notification]);

  function handleChange(nextDraft: NotificationDraft) {
    setNotificationResult((current) =>
      current?.api === queryApi &&
      current.notificationId === notificationId &&
      current.status === "loaded"
        ? { ...current, draft: nextDraft }
        : current
    );
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
    if (!notification || submitting.current) return false;

    const nextErrors = validateNotificationDraft(
      draft,
      new Date(),
      !notification.schedules.every(
        (schedule) => schedule.status === "scheduled"
      )
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;

    const request = toNotificationPatchRequest(notification, draft);
    if (!request) return false;

    submitting.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);
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
    ? notification.schedules.every(
        (schedule) => schedule.status === "scheduled"
      )
    : false;

  return {
    audienceError,
    audienceOptions,
    canEditAudience,
    configError,
    draft,
    errors,
    isAudienceLoading,
    importanceOptions,
    isRecipientCountLoading,
    isEditable: Boolean(notification),
    isLoading,
    isSubmitting,
    loadError,
    notification,
    onAudienceReload: () => setAudienceReloadKey((current) => current + 1),
    onChange: handleChange,
    recipientCount,
    recipientCountError,
    submissionError,
    submit,
  };
}

function toNotificationDraft(
  notification: AdminNotificationDetail
): NotificationDraft {
  const schedule = notification.schedules[0];
  return {
    title: notification.content.push.title,
    body: notification.content.push.body,
    detailTitle: notification.content.detail.title,
    detailBody: notification.content.detail.body,
    importance: notification.importance,
    audiences: (schedule?.audience.items ?? [{ type: "all" as const }]).map(
      (audience, index) => ({
        key: `audience-${index + 1}`,
        type: audience.type,
        targetId: audience.type === "all" ? "" : String(audience.targetId),
      })
    ),
    deliveryTiming: "scheduled",
    scheduledAt: toDateTimeLocalValue(schedule?.sendAt),
  };
}

function toNotificationPatchRequest(
  notification: AdminNotificationDetail,
  draft: NotificationDraft
): NotificationPatchRequest | null {
  const allSchedulesUnstarted = notification.schedules.every(
    (schedule) => schedule.status === "scheduled"
  );
  if (!allSchedulesUnstarted) {
    return {
      content: {
        detail: { title: draft.detailTitle, body: draft.detailBody },
      },
    };
  }

  const schedule = notification.schedules[0];
  if (!schedule) return null;

  const audienceItems = draft.audiences.map((audience) => {
    if (audience.type === "all") return { type: "all" as const };
    const targetId = Number(audience.targetId);
    return Number.isSafeInteger(targetId) && targetId > 0
      ? { type: audience.type, targetId }
      : null;
  });
  if (audienceItems.some((item) => item === null)) return null;

  const sendAt = draft.scheduledAt
    ? new Date(draft.scheduledAt).toISOString()
    : null;

  return {
    content: {
      push: { title: draft.title, body: draft.body },
      detail: { title: draft.detailTitle, body: draft.detailBody },
    },
    importance: draft.importance,
    schedule: {
      notificationScheduleId: schedule.notificationScheduleId,
      audience: { items: audienceItems.filter((item) => item !== null) },
      delivery:
        draft.deliveryTiming === "scheduled" && sendAt
          ? { type: "scheduled", sendAt }
          : { type: "immediate", sendAt: null },
    },
  };
}

function toDateTimeLocalValue(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

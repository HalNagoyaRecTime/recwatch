import { useEffect, useState } from "react";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type {
  AdminNotificationDetail,
  NotificationPatchRequest,
} from "~/features/notifications/model/admin-notification";
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
import {
  reportNotificationActionError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";

type UseNotificationEditOptions = {
  audienceApi: NotificationAudienceApi;
  commandApi: AdminNotificationCommandApi;
  queryApi: AdminNotificationQueryApi;
  notificationId: number;
  reportFeedback?: NotificationFeedbackReporter;
};

export function useNotificationEdit({
  audienceApi,
  commandApi,
  queryApi,
  notificationId,
  reportFeedback,
}: UseNotificationEditOptions) {
  const [notification, setNotification] =
    useState<AdminNotificationDetail | null>(null);
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [audienceOptions, setAudienceOptions] = useState<
    NotificationAudienceOption[]
  >([]);
  const [isAudienceLoading, setIsAudienceLoading] = useState(true);
  const [audienceError, setAudienceError] = useState<string | null>(null);
  const [audienceReloadKey, setAudienceReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

    queryApi
      .getDetail(notificationId)
      .then((loadedNotification) => {
        if (!active) return;
        setNotification(loadedNotification);
        setDraft(toNotificationDraft(loadedNotification));
      })
      .catch((error: unknown) => {
        if (!active) return;
        setNotification(null);
        setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [notificationId, queryApi]);

  useEffect(() => {
    let active = true;
    setIsAudienceLoading(true);
    setAudienceError(null);

    audienceApi
      .load()
      .then((options) => {
        if (active) setAudienceOptions(options);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAudienceOptions([]);
        setAudienceError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsAudienceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [audienceApi, audienceReloadKey]);

  function handleChange(nextDraft: NotificationDraft) {
    setDraft(nextDraft);
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
    if (!notification || isSubmitting) return false;

    const nextErrors = validateNotificationDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;

    const request = toNotificationPatchRequest(notification, draft);
    if (!request) return false;

    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const updated = await commandApi.patch(
        notification.notificationId,
        request
      );
      setNotification(updated);
      reportFeedback?.({
        kind: "action-success",
        title: "通知を更新しました",
        message: "通知の変更を保存しました。",
      });
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      setSubmissionError(message);
      reportNotificationActionError(reportFeedback, {
        title: "通知を更新できませんでした",
        message,
        action: "notification.patch",
        endpoint: `/api/v1/admin/notifications/${notification.notificationId}`,
        error,
      });
      return false;
    } finally {
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
    draft,
    errors,
    isAudienceLoading,
    isEditable: Boolean(notification),
    isLoading,
    isSubmitting,
    loadError,
    notification,
    onAudienceReload: () => setAudienceReloadKey((current) => current + 1),
    onChange: handleChange,
    submissionError,
    submit,
  };
}

function toNotificationDraft(
  notification: AdminNotificationDetail
): NotificationDraft {
  const schedule = notification.schedules[0];
  const audience = schedule?.audience.items[0] ?? { type: "all" as const };
  return {
    title: notification.content.push.title,
    body: notification.content.push.body,
    audienceType: audience.type,
    audienceId: audience.type === "all" ? "" : String(audience.targetId),
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
    return { content: { detail: { title: draft.title, body: draft.body } } };
  }

  const schedule = notification.schedules[0];
  if (!schedule) return null;

  const targetId = Number(draft.audienceId);
  const audienceItem =
    draft.audienceType === "all"
      ? ({ type: "all" } as const)
      : Number.isSafeInteger(targetId) && targetId > 0
        ? ({ type: draft.audienceType, targetId } as const)
        : null;
  if (!audienceItem) return null;

  const sendAt = draft.scheduledAt
    ? new Date(draft.scheduledAt).toISOString()
    : null;

  return {
    content: {
      push: { title: draft.title, body: draft.body },
      detail: { title: draft.title, body: draft.body },
    },
    schedule: {
      notificationScheduleId: schedule.notificationScheduleId,
      audience: { items: [audienceItem] },
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

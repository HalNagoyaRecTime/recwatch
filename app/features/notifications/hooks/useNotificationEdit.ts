import { useEffect, useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type {
  NotificationManagementApi,
  NotificationUpdate,
  NotificationUpdateAudience,
} from "~/features/notifications/api/contracts/notification-management-api";
import { ClientErrors, getErrorMessage } from "~/lib/client-error";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import {
  canModifyNotification,
  type ManagedNotification,
} from "~/features/notifications/model/notification";
import {
  initialNotificationDraft,
  type NotificationDraft,
} from "~/features/notifications/model/notification-draft";
import {
  validateNotificationDraft,
  type NotificationDraftErrors,
} from "~/features/notifications/model/notification-draft-validation";

type UseNotificationEditOptions = {
  api: NotificationManagementApi;
  audienceApi: NotificationAudienceApi;
  notificationId: number;
};

type NotificationEditResult =
  | {
      api: NotificationManagementApi;
      notificationId: number;
      status: "loaded";
      notification: ManagedNotification;
      draft: NotificationDraft;
    }
  | {
      api: NotificationManagementApi;
      notificationId: number;
      status: "error";
      error: string;
    };

export function useNotificationEdit({
  api,
  audienceApi,
  notificationId,
}: UseNotificationEditOptions) {
  const [notificationResult, setNotificationResult] =
    useState<NotificationEditResult | null>(null);
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [audienceReloadKey, setAudienceReloadKey] = useState(0);
  const [audienceResult, setAudienceResult] = useState<{
    api: NotificationAudienceApi;
    reloadKey: number;
    options: NotificationAudienceOption[];
    error: string | null;
  } | null>(null);

  const isValidNotificationId =
    Number.isSafeInteger(notificationId) && notificationId > 0;
  const currentNotificationResult =
    notificationResult?.api === api &&
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

    api
      .getById(notificationId)
      .then((loadedNotification) => {
        if (!active) return;

        setNotificationResult({
          api,
          notificationId,
          status: "loaded",
          notification: loadedNotification,
          draft: toNotificationDraft(loadedNotification),
        });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setNotificationResult({
          api,
          notificationId,
          status: "error",
          error: toManagementErrorMessage(error),
        });
      });

    return () => {
      active = false;
    };
  }, [api, isValidNotificationId, notificationId]);

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
    setNotificationResult((current) =>
      current?.api === api &&
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
      audienceId: nextDraft.audienceId ? undefined : current.audienceId,
      scheduledAt: nextDraft.scheduledAt ? undefined : current.scheduledAt,
    }));
  }

  async function submit() {
    if (!notification || !canModifyNotification(notification) || isSubmitting) {
      return false;
    }

    const nextErrors = validateNotificationDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return false;
    }

    const update = toNotificationUpdate(
      draft,
      isAudienceEditableFor(notification)
    );
    if (!update) {
      setSubmissionError(ClientErrors.INVALID_REQUEST.message);
      return false;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await api.update(notification.id, update);
      return true;
    } catch (error) {
      setSubmissionError(toManagementErrorMessage(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    audienceError,
    audienceOptions,
    canEditAudience: notification ? isAudienceEditableFor(notification) : false,
    draft,
    errors,
    isAudienceLoading,
    isEditable: notification ? canModifyNotification(notification) : false,
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

function toManagementErrorMessage(error: unknown) {
  return getErrorMessage(error);
}

function toAudienceErrorMessage(error: unknown) {
  return getErrorMessage(error);
}

function toNotificationDraft(
  notification: ManagedNotification
): NotificationDraft {
  const audience =
    notification.audience ??
    (notification.relatedEventId
      ? {
          type: "event_participants" as const,
          eventId: notification.relatedEventId,
        }
      : { type: "resolved_recipients" as const });

  return {
    title: notification.title,
    body: notification.body,
    audienceType:
      audience.type === "resolved_recipients" ? "all" : audience.type,
    audienceId:
      audience.type === "class_room"
        ? String(audience.classRoomId)
        : audience.type === "gathering"
          ? String(audience.gatheringId)
          : audience.type === "event_participants"
            ? String(audience.eventId)
            : "",
    deliveryTiming: "scheduled",
    scheduledAt: toDateTimeLocalValue(notification.scheduledAt),
  };
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );
  return localDate.toISOString().slice(0, 16);
}

function isAudienceEditableFor(notification: ManagedNotification) {
  return Boolean(
    notification.audience &&
    notification.audience.type !== "resolved_recipients"
  );
}

function toNotificationUpdate(
  draft: NotificationDraft,
  includeAudience: boolean
): NotificationUpdate | null {
  const scheduledAt = draft.scheduledAt
    ? new Date(draft.scheduledAt)
    : undefined;

  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
    return null;
  }

  const update: NotificationUpdate = {
    body: draft.body,
    scheduledAt: scheduledAt?.toISOString(),
    title: draft.title,
  };

  if (includeAudience) {
    const audience = toUpdateAudience(draft);
    if (!audience) return null;
    update.audience = audience;
  }

  return update;
}

function toUpdateAudience(draft: NotificationDraft) {
  if (draft.audienceType === "all") {
    return { type: "all" as const };
  }

  const id = Number(draft.audienceId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const audience: NotificationUpdateAudience =
    draft.audienceType === "class_room"
      ? { type: "class_room", classRoomId: id }
      : draft.audienceType === "gathering"
        ? { type: "gathering", gatheringId: id }
        : { type: "event_participants", eventId: id };

  return audience;
}

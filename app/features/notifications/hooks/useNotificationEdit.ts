import { useEffect, useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type {
  NotificationManagementApi,
  NotificationUpdate,
  NotificationUpdateAudience,
} from "~/features/notifications/api/contracts/notification-management-api";
import { ClientErrors, getErrorMessage } from "~/lib/client-error";
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
import { useNotificationAudienceOptions } from "~/features/notifications/hooks/useNotificationAudienceOptions";

type UseNotificationEditOptions = {
  api: NotificationManagementApi;
  audienceApi: NotificationAudienceApi;
  notificationId: number;
};

type LoadedRequest = {
  api: NotificationManagementApi;
  notificationId: number;
};

export function useNotificationEdit({
  api,
  audienceApi,
  notificationId,
}: UseNotificationEditOptions) {
  const [notification, setNotification] = useState<ManagedNotification | null>(
    null
  );
  const [draft, setDraft] = useState<NotificationDraft>(
    initialNotificationDraft
  );
  const [errors, setErrors] = useState<NotificationDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [loadedRequest, setLoadedRequest] = useState<LoadedRequest | null>(
    null
  );
  const { audienceError, audienceOptions, isAudienceLoading, reloadAudience } =
    useNotificationAudienceOptions(audienceApi);

  const hasValidNotificationId =
    Number.isSafeInteger(notificationId) && notificationId > 0;
  const isCurrentRequest =
    loadedRequest?.api === api &&
    loadedRequest.notificationId === notificationId;
  const currentNotification = isCurrentRequest ? notification : null;
  const currentDraft = isCurrentRequest ? draft : initialNotificationDraft;
  const currentLoadError = !hasValidNotificationId
    ? "通知IDが不正です。"
    : isCurrentRequest
      ? loadError
      : null;
  const isLoading = hasValidNotificationId && !isCurrentRequest;

  useEffect(() => {
    let active = true;

    if (!hasValidNotificationId) {
      return () => {
        active = false;
      };
    }

    api
      .getById(notificationId)
      .then((loadedNotification) => {
        if (!active) return;

        setNotification(loadedNotification);
        setDraft(toNotificationDraft(loadedNotification));
        setLoadError(null);
        setLoadedRequest({ api, notificationId });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setNotification(null);
        setLoadError(toManagementErrorMessage(error));
        setLoadedRequest({ api, notificationId });
      });

    return () => {
      active = false;
    };
  }, [api, hasValidNotificationId, notificationId]);

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
    if (
      !currentNotification ||
      !canModifyNotification(currentNotification) ||
      isSubmitting
    ) {
      return false;
    }

    const nextErrors = validateNotificationDraft(currentDraft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return false;
    }

    const update = toNotificationUpdate(
      currentDraft,
      isAudienceEditableFor(currentNotification)
    );
    if (!update) {
      setSubmissionError(ClientErrors.INVALID_REQUEST.message);
      return false;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await api.update(currentNotification.id, update);
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
    canEditAudience: currentNotification
      ? isAudienceEditableFor(currentNotification)
      : false,
    draft: currentDraft,
    errors,
    isAudienceLoading,
    isEditable: currentNotification
      ? canModifyNotification(currentNotification)
      : false,
    isLoading,
    isSubmitting,
    loadError: currentLoadError,
    notification: currentNotification,
    onAudienceReload: reloadAudience,
    onChange: handleChange,
    submissionError,
    submit,
  };
}

function toManagementErrorMessage(error: unknown) {
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

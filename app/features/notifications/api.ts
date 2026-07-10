import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { notificationHistoryItems } from "~/features/notifications/model/notification-history";
import {
  getTargetCandidates,
  type NotificationTargetType,
} from "~/features/notifications/model/notification-target";

export type ManualNotificationRequest = {
  title: string;
  body: string;
  targetType: NotificationTargetType;
  targetIds: string[];
};

export type NotificationPreviewResponse = {
  targetType: NotificationTargetType;
  targetNames: string[];
  recipientCount: number;
};

export type NotificationSendResponse = {
  notificationId: number;
  targetType: NotificationTargetType;
  recipientCount: number;
  sent: number;
  failed: number;
  status: "sent" | "failed";
};

function resolveTargetNames(
  targetType: NotificationTargetType,
  targetIds: string[]
) {
  if (targetType === "all") {
    return ["全体"];
  }

  return getTargetCandidates(targetType)
    .filter((candidate) => targetIds.includes(candidate.id))
    .map((candidate) => candidate.label);
}

function resolveRecipientCount(
  targetType: NotificationTargetType,
  targetIds: string[]
) {
  if (targetType === "all") {
    return 420;
  }

  return getTargetCandidates(targetType)
    .filter((candidate) => targetIds.includes(candidate.id))
    .reduce((sum, candidate) => sum + candidate.recipientCount, 0);
}

function toManualNotificationRequest(
  draft: NotificationDraft
): ManualNotificationRequest {
  return {
    title: draft.title,
    body: draft.body,
    targetType: draft.targetType,
    targetIds: draft.targetType === "all" ? [] : draft.targetIds,
  };
}

export const notificationsApi = {
  async previewTarget(
    targetType: NotificationTargetType,
    targetIds: string[]
  ): Promise<NotificationPreviewResponse> {
    return {
      targetType,
      targetNames: resolveTargetNames(targetType, targetIds),
      recipientCount: resolveRecipientCount(targetType, targetIds),
    };
  },

  async send(draft: NotificationDraft): Promise<NotificationSendResponse> {
    const request = toManualNotificationRequest(draft);
    const recipientCount = resolveRecipientCount(
      request.targetType,
      request.targetIds
    );

    return {
      notificationId: Date.now(),
      targetType: request.targetType,
      recipientCount,
      sent: recipientCount,
      failed: 0,
      status: "sent",
    };
  },

  async listHistory() {
    return notificationHistoryItems;
  },
};

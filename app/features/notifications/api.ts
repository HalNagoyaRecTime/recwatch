import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { notificationHistoryItems } from "~/features/notifications/model/notification-history";
import {
  getTargetCandidates,
  type NotificationTargetType,
} from "~/features/notifications/model/notification-target";

export type NotificationPreviewResponse = {
  targetType: NotificationTargetType;
  targetName: string;
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

function resolveTargetName(
  targetType: NotificationTargetType,
  targetId: string
) {
  if (targetType === "all") {
    return "全体";
  }

  return (
    getTargetCandidates(targetType).find(
      (candidate) => candidate.id === targetId
    )?.label ?? "未選択"
  );
}

function resolveRecipientCount(
  targetType: NotificationTargetType,
  targetId: string
) {
  if (targetType === "all") {
    return 420;
  }

  return (
    getTargetCandidates(targetType).find(
      (candidate) => candidate.id === targetId
    )?.recipientCount ?? 0
  );
}

export const notificationsApi = {
  async previewTarget(
    targetType: NotificationTargetType,
    targetId: string
  ): Promise<NotificationPreviewResponse> {
    return {
      targetType,
      targetName: resolveTargetName(targetType, targetId),
      recipientCount: resolveRecipientCount(targetType, targetId),
    };
  },

  async send(draft: NotificationDraft): Promise<NotificationSendResponse> {
    const recipientCount = resolveRecipientCount(
      draft.targetType,
      draft.targetId
    );

    return {
      notificationId: Date.now(),
      targetType: draft.targetType,
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
